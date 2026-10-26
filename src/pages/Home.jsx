import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  HOME_GROUP_IMAGE,
  NOTICES,
  SCHEDULES,
  VIDEOS,
} from "../data/siteData.js";
import SectionHeading from "../components/SectionHeading.jsx";
import Calendar from "../components/Calendar.jsx";
import MediaCard from "../components/MediaCard.jsx";

export default function Home() {
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
          src="/images/amblum.png"
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

      <section className="content-section schedule-section">
        <SectionHeading
          eyebrow="WHAT'S NEXT"
          title="Schedule"
          link={
            <Link className="text-link" to="/schedule">
              VIEW ALL SCHEDULE <ArrowUpRight size={15} />
            </Link>
          }
        />
        <Calendar compact />
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
        <div className="notice-list">
          {NOTICES.slice(0, 3).map((notice, index) => (
            <Link to="/notice" className="notice-row" key={notice.id}>
              <span className="notice-number">0{index + 1}</span>
              <span className="notice-category">{notice.category}</span>
              <span className="notice-title">{notice.title}</span>
              <span className="notice-date">{notice.date}</span>
              <ArrowUpRight className="notice-arrow" size={17} />
            </Link>
          ))}
        </div>
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
        <div className="media-grid">
          {VIDEOS.slice(0, 3).map((item, index) => (
            <MediaCard key={item.id} item={item} index={index} />
          ))}
        </div>
      </section>

      <section className="home-end-note">
        <Sparkles size={17} />
        <p>
          <strong>나이트멜로 화이팅</strong>
        </p>
        <span>FAN ARCHIVE</span>
      </section>
    </motion.div>
  );
}
