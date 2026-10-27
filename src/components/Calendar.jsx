import { memo, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { SCHEDULES } from "../data/siteData.js";
import { supabase } from "../lib/supabase.js";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const EMPTY_LIST = [];
const OUTFIT_LABELS = {
  special: "✨ 특별의상",
  birthday: "🎂 생일",
  orifuku: "👗 오리복",
  sub_orifuku: "👚 서브오리복",
};

const pad = (n) => String(n).padStart(2, "0");
const keyFor = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

const CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CALENDAR_READY = Boolean(CALENDAR_ID && API_KEY);

// 한 번에 불러올 기간 (오늘 기준 과거 6개월 ~ 미래 12개월)
// 달력을 넘겨도 이 범위 안이면 다시 불러오지 않아요.
const FETCH_PAST_MONTHS = 6;
const FETCH_FUTURE_MONTHS = 12;
const CACHE_TTL = 5 * 60 * 1000; // 5분 동안은 같은 결과를 재사용

// 홈 ↔ 스케줄 페이지를 오가도 API를 또 부르지 않도록 모듈 단위로 저장
const eventCache = new Map();

const monthIndex = (year, month) => year * 12 + month;
const monthStartDate = (index) =>
  new Date(Math.floor(index / 12), index % 12, 1);

export function isKnightMelloEvent(event) {
  const title = String(event.title || event.summary || "").trim();
  return /^\[\s*knight\s+mello\s*\]/i.test(title);
}

// Google Calendar 연결 전 샘플 일정도 Knight Mello 일정만 한 번만 걸러둠
const FALLBACK_EVENTS = SCHEDULES.filter(isKnightMelloEvent);

function formatEventDate(event) {
  if (event.start?.date) return event.start.date;

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

  const doc = new DOMParser().parseFromString(String(html), "text/html");

  // 일정 설명에 줄바꿈이 부족할 때 자동으로 구분
  const renderText = (text, key, insideLink = false) => {
    // 링크 주소나 링크 내부의 글자는 변경하지 않음
    if (insideLink) return text;

    const output = [];
    const lines = text.split(/\r\n|\r|\n/);
    let breakIndex = 0;

    const markers =
      /(20\d{2}\.\d{1,2}\.\d{1,2}\.|장소\s*:|OPEN\s*\d{1,2}:\d{2}|ADV\s*:|DOOR\s*:|예약\s*:|予約\s*:|🎁|무대중)/gi;

    lines.forEach((line, lineIndex) => {
      // 원래 입력된 줄바꿈도 유지
      if (lineIndex > 0) {
        output.push(<br key={`${key}-newline-${lineIndex}`} />);
      }

      let cursor = 0;
      let hasTextOnLine = false;
      let match;
      markers.lastIndex = 0;

      while ((match = markers.exec(line)) !== null) {
        const before = line.slice(cursor, match.index);

        if (before) {
          output.push(before);

          if (before.trim()) {
            hasTextOnLine = true;
          }
        }

        const marker = match[0];
        const needsExtraSpace =
          marker.startsWith("🎁") || /^무대중/i.test(marker);

        // 같은 줄에 내용이 붙어 있으면 새 줄로 분리
        if (hasTextOnLine) {
          output.push(<br key={`${key}-auto-${breakIndex++}`} />);

          if (needsExtraSpace) {
            output.push(<br key={`${key}-gap-${breakIndex++}`} />);
          }
        }

        output.push(marker);
        hasTextOnLine = true;
        cursor = match.index + marker.length;
      }

      const rest = line.slice(cursor);

      if (rest) {
        output.push(rest);
      }
    });

    return output;
  };

  const renderNode = (node, key, insideLink = false) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return renderText(node.textContent || "", key, insideLink);
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const tag = node.tagName.toLowerCase();
    const isLink = insideLink || tag === "a";

    if (tag === "br") {
      return <br key={key} />;
    }

    const children = Array.from(node.childNodes).map((child, index) =>
      renderNode(child, `${key}-${index}`, isLink),
    );

    // 기존 링크 유지: 안전한 HTTP/HTTPS 주소만 허용
    if (tag === "a") {
      const href = node.getAttribute("href");

      if (href && /^https?:\/\//i.test(href)) {
        return (
          <a key={key} href={href} target="_blank" rel="noopener noreferrer">
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

    // 그 외 태그는 실행하지 않고 내용만 표시
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

// from ~ to(미포함) 월 범위의 Knight Mello 일정만 가져옴
async function loadKnightMelloEvents(from, to, signal) {
  const cacheKey = `${from}:${to}`;
  const cached = eventCache.get(cacheKey);

  if (cached && Date.now() - cached.savedAt < CACHE_TTL) {
    return cached.events;
  }

  const params = new URLSearchParams({
    key: API_KEY,
    timeMin: monthStartDate(from).toISOString(),
    timeMax: monthStartDate(to).toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "250",
  });

  const items = await fetchGoogleEvents(params, signal);
  const events = items
    .map(normalizeGoogleEvent)
    .filter((event) => event.date && isKnightMelloEvent(event));

  eventCache.set(cacheKey, { savedAt: Date.now(), events });
  return events;
}

// 설명 변환은 비싼 작업(HTML 파싱)이라 설명이 바뀔 때만 다시 계산
const EventDescription = memo(function EventDescription({ html }) {
  const content = useMemo(() => renderDescription(html), [html]);
  return <div className="event-description">{content}</div>;
});

const EventItem = memo(function EventItem({ event }) {
  return (
    <article className="event-item">
      <span className="event-tag">{event.title}</span>

      <h4>{event.detail}</h4>
      {event.outfit && (
        <div className={`outfit-badge outfit-${event.outfit.outfit_type}`}>
          {OUTFIT_LABELS[event.outfit.outfit_type] ?? "의상 정보"}
        </div>
      )}

      {event.outfit?.description && (
        <p className="outfit-description">{event.outfit.description}</p>
      )}

      {event.outfit?.image_url && (
        <a
          href={event.outfit.image_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          의상 사진 보기 ↗
        </a>
      )}

      <p>
        <Clock size={14} />
        {event.time}
      </p>

      <p>
        <MapPin size={14} />
        {event.place}
      </p>

      {event.description && <EventDescription html={event.description} />}

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
  );
});

export default function Calendar({ compact = false, onEventsChange }) {
  const [today] = useState(() => new Date());
  const todayKey = keyFor(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const [view, setView] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const [selected, setSelected] = useState(todayKey);

  const [range, setRange] = useState(() => {
    const current = monthIndex(today.getFullYear(), today.getMonth());
    return {
      from: current - FETCH_PAST_MONTHS,
      to: current + FETCH_FUTURE_MONTHS,
    };
  });
  const [googleEvents, setGoogleEvents] = useState(EMPTY_LIST);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [outfitOverrides, setOutfitOverrides] = useState(EMPTY_LIST);

  useEffect(() => {
    let active = true;

    const loadOutfits = async () => {
      const { data, error } = await supabase
        .from("outfit_overrides")
        .select("event_id, outfit_type, description, image_url");

      if (active && !error) {
        setOutfitOverrides(data ?? []);
      }
    };

    loadOutfits();

    return () => {
      active = false;
    };
  }, []);

  // 보고 있는 달이 불러온 범위를 벗어나면 범위를 넓힘 (이미 불러온 기간은 유지)
  useEffect(() => {
    const index = monthIndex(view.year, view.month);

    setRange((prev) => {
      if (index < prev.from) {
        return { ...prev, from: index - FETCH_PAST_MONTHS };
      }
      if (index >= prev.to) {
        return { ...prev, to: index + FETCH_FUTURE_MONTHS };
      }
      return prev;
    });
  }, [view.year, view.month]);

  useEffect(() => {
    if (!GOOGLE_CALENDAR_READY) return undefined;

    const controller = new AbortController();

    setLoading(true);
    setLoadError("");

    loadKnightMelloEvents(range.from, range.to, controller.signal)
      .then(setGoogleEvents)
      .catch((error) => {
        if (error.name !== "AbortError") {
          setGoogleEvents(EMPTY_LIST);
          setLoadError(error.message || "일정을 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [range.from, range.to]);

  // 이미 Knight Mello 일정만 걸러진 목록
  const events = GOOGLE_CALENDAR_READY ? googleEvents : FALLBACK_EVENTS;

  useEffect(() => {
    onEventsChange?.(events);
  }, [events, onEventsChange]);

  // 날짜별로 한 번만 묶어두면, 칸마다 전체 일정을 뒤질 필요가 없어요.
  const eventsByDate = useMemo(() => {
    const map = new Map();

    for (const event of events) {
      const outfit = outfitOverrides.find((item) => item.event_id === event.id);

      const eventWithOutfit = { ...event, outfit };
      const list = map.get(event.date);

      if (list) list.push(eventWithOutfit);
      else map.set(event.date, [eventWithOutfit]);
    }

    return map;
  }, [events, outfitOverrides]);

  const cells = useMemo(() => {
    const offset = new Date(view.year, view.month, 1).getDay();
    const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
    const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, i) => {
      const day = i - offset + 1;

      if (day < 1 || day > daysInMonth) {
        return { key: `blank-${i}`, blank: true };
      }

      const date = keyFor(view.year, view.month, day);
      const dayEvents = eventsByDate.get(date) || EMPTY_LIST;

      return {
        key: date,
        day,
        date,
        dayEvents,
        hasEvent: dayEvents.length > 0,
      };
    });
  }, [view.year, view.month, eventsByDate]);

  const monthEventCount = useMemo(() => {
    const prefix = `${view.year}-${pad(view.month + 1)}`;
    return events.filter((event) => event.date.startsWith(prefix)).length;
  }, [events, view.year, view.month]);

  const selectedEvents = eventsByDate.get(selected) || EMPTY_LIST;

  const changeMonth = (step) => {
    setView(({ year, month }) => {
      const next = new Date(year, month + step, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
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
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="이전 달"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="다음 달"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="calendar-outfit-legend">
          {Object.entries(OUTFIT_LABELS).map(([type, label]) => (
            <span
              key={type}
              className={`outfit-legend-item outfit-legend-${type}`}
            >
              {label}
            </span>
          ))}
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
                type="button"
                className={[
                  "calendar-cell",
                  cell.date === selected ? "selected" : "",
                  cell.hasEvent ? "has-event" : "",
                  cell.date === todayKey ? "today" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelected(cell.date)}
                aria-pressed={cell.date === selected}
                aria-label={`${cell.date}${
                  cell.hasEvent
                    ? ` Knight Mello 일정 ${cell.dayEvents.length}개`
                    : ""
                }`}
              >
                <span className="calendar-day-number">{cell.day}</span>

                {cell.hasEvent && (
                  <div className="calendar-day-events">
                    {cell.dayEvents.map((event, eventIndex) => (
                      <span
                        key={
                          event.id ||
                          `${cell.date}-${event.title}-${eventIndex}`
                        }
                        className={[
                          "calendar-event-title",
                          event.outfit?.outfit_type === "special"
                            ? "calendar-event-special"
                            : "",
                          event.outfit?.outfit_type
                            ? `calendar-event-outfit-${event.outfit.outfit_type}`
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        title={event.detail || event.title}
                      >
                        {event.outfit?.outfit_type === "special" && "✨ "}
                        {event.outfit?.outfit_type === "birthday" && "🎂 "}
                        {event.outfit?.outfit_type === "orifuku" && "👗 "}
                        {event.outfit?.outfit_type === "sub_orifuku" && "👚 "}
                        {event.detail || event.title}
                      </span>
                    ))}
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
          <div className="calendar-status" role="status">
            <RefreshCw size={14} className="spin" />
            Google Calendar 일정을 불러오는 중...
          </div>
        )}

        {loadError && (
          <div className="calendar-error" role="alert">
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
              <EventItem
                key={event.id || `${event.date}-${event.title}`}
                event={event}
              />
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
            {pad(monthEventCount)} <small>EVENTS</small>
          </strong>
        </div>
      </aside>
    </div>
  );
}
