import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { SCHEDULES } from "../data/siteData.js";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const pad = (n) => String(n).padStart(2, "0");

const keyFor = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

const GOOGLE_CALENDAR_READY = Boolean(CALENDAR_ID && API_KEY);

const KNIGHT_MELLO_KEYWORDS = ["knight mello", "knightmello", "나이트멜로"];

function isKnightMelloEvent(event) {
  const text = [event.title, event.detail, event.description]
    .join(" ")
    .toLowerCase();

  return KNIGHT_MELLO_KEYWORDS.some((keyword) => text.includes(keyword));
}

function formatEventDate(event) {
  if (event.start?.date) {
    return event.start.date;
  }

  const raw = event.start?.dateTime;

  if (!raw) return "";

  const date = new Date(raw);

  return keyFor(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatEventTime(event) {
  if (event.start?.date) return "종일";

  const raw = event.start?.dateTime;

  if (!raw) return "시간 미정";

  return new Date(raw).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function renderDescription(html) {
  if (!html) return null;

  const doc = new DOMParser().parseFromString(html, "text/html");

  const renderNode = (node, key) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const tag = node.tagName.toLowerCase();

    if (tag === "br") {
      return <br key={key} />;
    }

    const children = Array.from(node.childNodes).map((child, index) =>
      renderNode(child, `${key}-${index}`),
    );

    if (tag === "a") {
      const href = node.getAttribute("href");

      if (href && /^https?:\/\//i.test(href)) {
        return (
          <a key={key} href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
      }

      return <span key={key}>{children}</span>;
    }

    if (tag === "p" || tag === "div") {
      return <p key={key}>{children}</p>;
    }

    if (tag === "strong" || tag === "b") {
      return <strong key={key}>{children}</strong>;
    }

    if (tag === "em" || tag === "i") {
      return <em key={key}>{children}</em>;
    }

    // 그 외 HTML 태그는 실행하지 않고 내용만 표시
    return <span key={key}>{children}</span>;
  };

  return Array.from(doc.body.childNodes).map((node, index) =>
    renderNode(node, `description-${index}`),
  );
}

function normalizeGoogleEvent(event) {
  return {
    id: event.id,
    date: formatEventDate(event),
    time: formatEventTime(event),
    title: (event.summary || "제목 없는 일정").toUpperCase(),
    detail: event.summary || "제목 없는 일정",
    place: event.location || "장소 안내 확인",
    description: event.description || "",
    htmlLink: event.htmlLink || "",
  };
}

async function fetchGoogleEvents(params, signal) {
  const events = [];
  let pageToken = "";

  do {
    if (pageToken) {
      params.set("pageToken", pageToken);
    } else {
      params.delete("pageToken");
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
        CALENDAR_ID,
      )}/events?${params.toString()}`,
      { signal },
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error?.message ||
          "Google Calendar에서 일정을 불러오지 못했습니다.",
      );
    }

    events.push(...(data.items || []));
    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return events;
}

export default function Calendar({ compact = false }) {
  const today = new Date();

  const [view, setView] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  const [selected, setSelected] = useState(
    keyFor(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  const [googleEvents, setGoogleEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const monthStart = new Date(view.year, view.month, 1);
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();

  const offset = monthStart.getDay();

  useEffect(() => {
    if (!GOOGLE_CALENDAR_READY) {
      setGoogleEvents([]);
      setLoadError("");
      return;
    }

    const timeMin = new Date(view.year, view.month, 1).toISOString();

    const timeMax = new Date(view.year, view.month + 1, 1).toISOString();

    const params = new URLSearchParams({
      key: API_KEY,
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "250",
    });

    const controller = new AbortController();

    setLoading(true);
    setLoadError("");

    fetchGoogleEvents(params, controller.signal)
      .then((items) => {
        setGoogleEvents(
          items.map(normalizeGoogleEvent).filter((event) => event.date),
        );
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setGoogleEvents([]);
          setLoadError(error.message || "일정을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [view.year, view.month]);

  // Knight Mello 관련 일정만 사용
  const events = useMemo(
    () =>
      (GOOGLE_CALENDAR_READY ? googleEvents : SCHEDULES).filter(
        isKnightMelloEvent,
      ),
    [googleEvents],
  );

  const todayKey = keyFor(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const cells = useMemo(
    () => [
      ...Array.from({ length: offset }, (_, i) => ({
        key: `blank-${i}`,
        blank: true,
      })),

      ...Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const date = keyFor(view.year, view.month, day);

        const dayEvents = events.filter((event) => event.date === date);

        return {
          key: date,
          day,
          date,
          dayEvents,
          hasEvent: dayEvents.length > 0,
        };
      }),

      ...Array.from(
        {
          length: (7 - ((offset + daysInMonth) % 7)) % 7,
        },
        (_, i) => ({
          key: `tail-${i}`,
          blank: true,
        }),
      ),
    ],
    [view.year, view.month, daysInMonth, offset, events],
  );

  const monthPrefix = `${view.year}-${pad(view.month + 1)}`;

  const monthEvents = events.filter((event) =>
    event.date.startsWith(monthPrefix),
  );

  const selectedEvents = events.filter((event) => event.date === selected);

  const changeMonth = (step) => {
    setView(({ year, month }) => {
      const next = new Date(year, month + step, 1);

      return {
        year: next.getFullYear(),
        month: next.getMonth(),
      };
    });
  };

  return (
    <div className={`calendar-layout ${compact ? "calendar-compact" : ""}`}>
      <div className="calendar-main">
        <div className="calendar-toolbar">
          <div>
            <span className="calendar-year">{view.year}</span>

            <h3>
              {new Date(view.year, view.month).toLocaleDateString("en-US", {
                month: "long",
              })}
            </h3>
          </div>

          <div className="calendar-controls">
            <button onClick={() => changeMonth(-1)} aria-label="이전 달">
              <ChevronLeft size={18} />
            </button>

            <button onClick={() => changeMonth(1)} aria-label="다음 달">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="calendar-grid weekday-row">
          {WEEKDAYS.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="calendar-grid date-grid">
          {cells.map((cell) =>
            cell.blank ? (
              <div key={cell.key} className="calendar-cell blank" />
            ) : (
              <button
                key={cell.key}
                className={[
                  "calendar-cell",
                  cell.date === selected ? "selected" : "",
                  cell.hasEvent ? "has-event" : "",
                  cell.date === todayKey ? "today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelected(cell.date)}
                aria-label={`${cell.date}${
                  cell.hasEvent
                    ? ` Knight Mello 일정 ${cell.dayEvents.length}개`
                    : ""
                }`}
              >
                <span className="calendar-day-number">{cell.day}</span>

                {cell.hasEvent && (
                  <div className="calendar-day-events">
                    {cell.dayEvents.slice(0, 2).map((event, index) => (
                      <span
                        key={event.id || `${event.date}-${event.title}`}
                        className={`calendar-day-event event-color-${
                          index % 3
                        }`}
                        title={event.detail}
                      >
                        {event.detail || event.title}
                      </span>
                    ))}

                    {cell.dayEvents.length > 2 && (
                      <span className="calendar-day-more">
                        +{cell.dayEvents.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ),
          )}
        </div>

        <p className="calendar-legend">
          <span className="legend-event-label">EVENT</span>
          Knight Mello 일정이 있는 날짜예요.
        </p>
      </div>

      <aside className="calendar-events">
        <div className="event-panel-heading">
          <p className="eyebrow">
            {GOOGLE_CALENDAR_READY
              ? "KNIGHT MELLO SCHEDULE"
              : "SCHEDULE PREVIEW"}
          </p>

          <h3>
            {selected ? selected.replaceAll("-", ".") : "날짜를 선택하세요"}
          </h3>
        </div>

        {loading && (
          <div className="calendar-status">
            <RefreshCw size={14} className="spin" />
            Google Calendar 일정을 불러오는 중...
          </div>
        )}

        {loadError && (
          <div className="calendar-error">
            연동 오류: {loadError}
            <p>.env 설정과 캘린더 공개 권한을 확인해 주세요.</p>
          </div>
        )}

        {!GOOGLE_CALENDAR_READY && (
          <div className="calendar-setup-hint">
            <CalendarDays size={16} />
            <span>
              Google Calendar 연결 전입니다.
              <br />
              <code>package.json</code>과 같은 폴더에 <code>.env</code> 파일을
              설정해 주세요.
            </span>
          </div>
        )}

        {!loading && selectedEvents.length > 0
          ? selectedEvents.map((event) => (
              <article
                className="event-item"
                key={event.id || `${event.date}-${event.title}`}
              >
                <span className="event-tag">{event.title}</span>

                <h4>{event.detail}</h4>

                <p>
                  <Clock size={14} />
                  {event.time}
                </p>

                <p>
                  <MapPin size={14} />
                  {event.place}
                </p>

                {event.description && (
                  <div className="event-description">
                    {renderDescription(event.description)}
                  </div>
                )}

                {event.htmlLink && (
                  <a
                    className="event-google-link"
                    href={event.htmlLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Google Calendar에서 보기 ↗
                  </a>
                )}
              </article>
            ))
          : !loading &&
            !loadError && (
              <div className="empty-events">
                <span className="empty-star">✳</span>

                <p>
                  {GOOGLE_CALENDAR_READY
                    ? "이 날짜에 Knight Mello 일정이 없습니다."
                    : "등록된 일정이 없습니다."}
                </p>

                <span>다른 날짜도 확인해 보세요.</span>
              </div>
            )}

        <div className="monthly-count">
          <span>KNIGHT MELLO EVENTS</span>

          <strong>
            {monthEvents.length.toString().padStart(2, "0")}{" "}
            <small>EVENTS</small>
          </strong>
        </div>
      </aside>
    </div>
  );
}
