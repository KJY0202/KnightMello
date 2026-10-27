import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

const OUTFIT_TYPES = [
  { value: "special", label: "✨ 특별의상" },
  { value: "birthday", label: "🎂 생일" },
  { value: "orifuku", label: "🦆 오리복" },
  { value: "sub_orifuku", label: "🦆 서브오리복" },
];

const pad = (n) => String(n).padStart(2, "0");

const getDate = (event) => {
  if (event.start?.date) return event.start.date;

  const date = new Date(event.start?.dateTime);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getTypeLabel = (value) =>
  OUTFIT_TYPES.find((type) => type.value === value)?.label ?? value;

export default function Admin() {
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [events, setEvents] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [outfitType, setOutfitType] = useState("special");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const calendarId = import.meta.env.VITE_GOOGLE_CALENDAR_ID;
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

  const selectedEvent = events.find((event) => event.id === selectedId);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_admin");

      if (adminError || !isAdmin) {
        await supabase.auth.signOut();
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!active) return;
      setChecking(false);

      const { data: saved, error: savedError } = await supabase
        .from("outfit_overrides")
        .select("*");

      if (savedError) {
        setMessage(`의상 정보를 불러오지 못했어요: ${savedError.message}`);
      } else if (active) {
        setOverrides(saved ?? []);
      }

      if (!calendarId || !apiKey) {
        setMessage("Google Calendar 환경변수를 확인해 주세요.");
        return;
      }

      try {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        const to = new Date(now.getFullYear(), now.getMonth() + 12, 1);

        const params = new URLSearchParams({
          key: apiKey,
          timeMin: from.toISOString(),
          timeMax: to.toISOString(),
          singleEvents: "true",
          orderBy: "startTime",
          maxResults: "250",
        });

        const allEvents = [];

        while (true) {
          const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error?.message || "일정 조회 실패");
          }

          allEvents.push(...(data.items ?? []));

          if (!data.nextPageToken) break;
          params.set("pageToken", data.nextPageToken);
        }

        const filtered = allEvents
          .filter((event) =>
            /^\[\s*knight\s+mello\s*\]/i.test(event.summary?.trim() ?? ""),
          )
          .filter((event) => event.id && getDate(event))
          .map((event) => ({
            id: event.id,
            date: getDate(event),
            title: event.summary || "제목 없는 일정",
          }));

        filtered.sort(
          (a, b) =>
            a.date.localeCompare(b.date) || a.title.localeCompare(b.title),
        );

        if (active) {
          setEvents(filtered);
          setSelectedId((current) => current || filtered[0]?.id || "");
        }
      } catch (error) {
        if (active) {
          setMessage(`일정 조회 오류: ${error.message}`);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [navigate, calendarId, apiKey]);

  useEffect(() => {
    const saved = overrides.find((item) => item.event_id === selectedId);

    setOutfitType(saved?.outfit_type ?? "special");
    setDescription(saved?.description ?? "");
    setImageUrl(saved?.image_url ?? "");
  }, [selectedId, overrides]);

  const saveOutfit = async (event) => {
    event.preventDefault();

    if (!selectedEvent) {
      setMessage("먼저 일정을 선택해 주세요.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("outfit_overrides")
      .upsert(
        {
          event_id: selectedEvent.id,
          event_title: selectedEvent.title,
          outfit_type: outfitType,
          description,
          image_url: imageUrl.trim() || null,
        },
        { onConflict: "event_id" },
      )
      .select()
      .single();

    setLoading(false);

    if (error) {
      setMessage(`저장 실패: ${error.message}`);
      return;
    }

    setOverrides((current) => [
      ...current.filter((item) => item.event_id !== selectedEvent.id),
      data,
    ]);
    setMessage("의상 정보가 저장됐어요!");
  };

  const deleteOutfit = async () => {
    if (!selectedEvent) return;

    const { error } = await supabase
      .from("outfit_overrides")
      .delete()
      .eq("event_id", selectedEvent.id);

    if (error) {
      setMessage(`삭제 실패: ${error.message}`);
      return;
    }

    setOverrides((current) =>
      current.filter((item) => item.event_id !== selectedEvent.id),
    );
    setMessage("의상 표시를 삭제했어요.");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  if (checking) return <main>관리자 권한 확인 중...</main>;

  return (
    <main className="outfit-admin">
      <header className="outfit-admin-header">
        <div>
          <p className="eyebrow">KNIGHT MELLO ARCHIVE</p>
          <h1>의상 관리</h1>
          <p>라이브 일정을 선택하고 의상 정보를 등록해 주세요.</p>
        </div>
        <button type="button" onClick={logout}>
          로그아웃
        </button>
      </header>

      <form className="outfit-admin-form" onSubmit={saveOutfit}>
        <label htmlFor="event-select">라이브 일정</label>
        <select
          id="event-select"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          required
        >
          {events.length === 0 && <option value="">일정 불러오는 중...</option>}
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.date} · {event.title}
            </option>
          ))}
        </select>

        {selectedEvent && (
          <p className="outfit-admin-current">
            현재 등록:{" "}
            {overrides.find((item) => item.event_id === selectedId)
              ? getTypeLabel(
                  overrides.find((item) => item.event_id === selectedId)
                    .outfit_type,
                )
              : "등록된 의상 없음"}
          </p>
        )}

        <label htmlFor="outfit-type">의상 종류</label>
        <select
          id="outfit-type"
          value={outfitType}
          onChange={(event) => setOutfitType(event.target.value)}
        >
          {OUTFIT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <label htmlFor="outfit-description">설명 (선택)</label>
        <textarea
          id="outfit-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="예: 에모 생일 라이브 의상"
          rows={3}
        />

        <label htmlFor="outfit-image">사진 주소 (선택)</label>
        <input
          id="outfit-image"
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="https://..."
        />

        <div className="outfit-admin-actions">
          <button type="submit" disabled={loading || !selectedEvent}>
            {loading ? "저장 중..." : "저장하기"}
          </button>
          <button
            type="button"
            className="outfit-delete-button"
            disabled={!selectedEvent}
            onClick={deleteOutfit}
          >
            의상 표시 삭제
          </button>
        </div>

        {message && <p role="status">{message}</p>}
      </form>
    </main>
  );
}
