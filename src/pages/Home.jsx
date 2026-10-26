import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  HOME_GROUP_IMAGE,
  NOTICES,
  OFFICIAL_X_URL,
  VIDEOS,
} from "../data/siteData.js";
import SectionHeading from "../components/SectionHeading.jsx";
import Calendar from "../components/Calendar.jsx";
import MediaCard from "../components/MediaCard.jsx";

const today = new Date();
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

const isPlaceholderSchedule = (schedule) =>
  /sample event|google calendar 연결 전|siteData\.js에서 수정/i.test(
    [schedule.title, schedule.detail, schedule.place].filter(Boolean).join(" "),
  );

function formatScheduleDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: String(date.getDate()).padStart(2, "0"),
    weekday: date.toLocaleDateString("ko-KR", { weekday: "short" }),
  };
}

function UpcomingSchedule({ schedules }) {
  return (
    <div className="upcoming-block">
      <div className="upcoming-block-label">
        <span>
          <Sparkles size={14} /> NEXT LIVE
        </span>
        <span>UPCOMING EVENTS</span>
      </div>

      {schedules.length > 0 ? (
        <motion.div
          className="upcoming-schedule-list"
          initial="hidden"
          animate="visible"
          viewport={{ once: true, amount: 0.18 }}
          variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
        >
          {schedules.map((schedule, index) => {
            const date = formatScheduleDate(schedule.date);
            return (
              <motion.article
                className="upcoming-schedule-card"
                key={`${schedule.date}-${schedule.title}-${index}`}
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4 }}
              >
                <div
                  className="upcoming-date-block"
                  aria-label={`${schedule.date} ${date.weekday}`}
                >
                  <span>{date.month}</span>
                  <strong>{date.day}</strong>
                  <small>{date.weekday}</small>
                </div>
                <div className="upcoming-event-copy">
                  <span className="upcoming-event-index">
                    LIVE / 0{index + 1}
                  </span>
                  <h3>{schedule.title}</h3>
                  {schedule.detail && schedule.detail !== schedule.title && (
                    <p className="upcoming-event-detail">{schedule.detail}</p>
                  )}
                  <div className="upcoming-event-meta">
                    {schedule.time && (
                      <span>
                        <Clock3 size={13} /> {schedule.time}
                      </span>
                    )}
                    {schedule.place && (
                      <span>
                        <MapPin size={13} /> {schedule.place}
                      </span>
                    )}
                  </div>
                </div>
                <span className="upcoming-event-sparkle" aria-hidden="true">
                  ✳
                </span>
              </motion.article>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          className="upcoming-empty"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <span className="upcoming-empty-icon">
            <CalendarDays size={21} />
          </span>
          <div className="upcoming-empty-copy">
            <strong>새로운 일정을 기다리고 있어요.</strong>
            <p>
              등록된 예정 일정이 없습니다. 최신 공연 소식은 공식 SNS에서 확인해
              주세요.
            </p>
          </div>
          <a
            className="upcoming-official-link"
            href={OFFICIAL_X_URL}
            target="_blank"
            rel="noreferrer"
          >
            OFFICIAL X <ArrowUpRight size={15} />
          </a>
        </motion.div>
      )}
    </div>
  );
}

export default function Home() {
  const [calendarSchedules, setCalendarSchedules] = useState([]);
  const handleCalendarEvents = useCallback((events) => {
    setCalendarSchedules(events);
  }, []);
  const upcomingSchedules = useMemo(
    () =>
      calendarSchedules
        .filter(
          (schedule) =>
            schedule.date &&
            schedule.date >= todayKey &&
            !isPlaceholderSchedule(schedule),
        )
        .sort((a, b) =>
          `${a.date} ${a.time || "23:59"}`.localeCompare(
            `${b.date} ${b.time || "23:59"}`,
          ),
        )
        .slice(0, 3),
    [calendarSchedules],
  );

  return (
    <motion.div
      className="page home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <section className="hero-visual">
        {HOME_GROUP_IMAGE ? (
          <img
            className="hero-group-image"
            src={HOME_GROUP_IMAGE}
            alt="Knight Mello 단체 사진"
          />
        ) : (
          <div className="hero-image-placeholder">
            <div className="hero-placeholder-grid" />
            <span className="hero-corner hero-corner-tl">
              KNIGHT MELLO / UNOFFICIAL ARCHIVE
            </span>
            <div className="hero-placeholder-center">
              <span className="hero-star">✳</span>
              <p>YOUR GROUP PHOTO GOES HERE</p>
              <span>src/data/siteData.js → HOME_GROUP_IMAGE</span>
            </div>
            <span className="hero-corner hero-corner-br">
              UNOFFICIAL FAN SITE · EST. 2026
            </span>
          </div>
        )}
        <div className="hero-overlay">
          <Link to="/profile" className="hero-link">
            MEET THE MEMBERS <ArrowUpRight size={15} />
          </Link>
        </div>
        <img
          src={`${import.meta.env.BASE_URL}images/amblum.png`}
          alt="Knight Mello"
          className="amblum-logo"
        />
        <div className="hero-bottom-label">
          <span>01 — THE GROUP</span>
          <span>
            SCROLL TO DISCOVER <ArrowDownRight size={14} />
          </span>
        </div>
      </section>

      <section className="content-section schedule-section home-schedule-section">
        <SectionHeading
          eyebrow="WHAT'S NEXT"
          title="Schedule"
          link={
            <Link className="text-link" to="/schedule">
              VIEW ALL SCHEDULE <ArrowUpRight size={15} />
            </Link>
          }
        />
        <UpcomingSchedule schedules={upcomingSchedules} />
        <div className="home-calendar-heading">
          <span>MONTHLY CALENDAR</span>
          <span>일정을 눌러 상세 내용을 확인하세요</span>
        </div>
        <Calendar compact onEventsChange={handleCalendarEvents} />
      </section>

      <section className="content-section notice-section">
        <SectionHeading
          eyebrow="LATEST UPDATE"
          title="Notice"
          link={
            <Link className="text-link" to="/notice">
              ALL NOTICES <ArrowUpRight size={15} />
            </Link>
          }
        />
        <motion.div
          className="notice-list"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {NOTICES.slice(0, 3).map((notice, index) => (
            <motion.div
              key={notice.id}
              variants={{
                hidden: { opacity: 0, x: -12 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.35 }}
            >
              <Link to="/notice" className="notice-row">
                <span className="notice-number">0{index + 1}</span>
                <span className="notice-category">{notice.category}</span>
                <span className="notice-title">{notice.title}</span>
                <span className="notice-date">{notice.date}</span>
                <ArrowUpRight className="notice-arrow" size={17} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="content-section video-section">
        <SectionHeading
          eyebrow="WATCH AGAIN"
          title="Video"
          link={
            <Link className="text-link" to="/video">
              EXPLORE VIDEOS <ArrowUpRight size={15} />
            </Link>
          }
        />
        <motion.div
          className="media-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
          {VIDEOS.slice(0, 3).map((item, index) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <MediaCard item={item} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </section>
    </motion.div>
  );
}
