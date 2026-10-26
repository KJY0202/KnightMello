import { useState } from "react";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageIntro from "../components/PageIntro.jsx";
import { NOTICES } from "../data/siteData.js";

export default function Notice() {
  const [opened, setOpened] = useState(NOTICES[0]?.id);
  return <motion.div className="page inner-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <PageIntro eyebrow="NEWS & UPDATES" title="Notice" description="나이트멜로 관련 소식과 사이트 업데이트를 모아둡니다." />
    <section className="inner-content">
      <div className="list-topline"><span>ALL POSTS</span><span>{String(NOTICES.length).padStart(2, "0")} ARTICLES</span></div>
      <div className="notice-accordion">
        {NOTICES.map((notice, index) => <article className={`notice-article ${opened === notice.id ? "opened" : ""}`} key={notice.id}>
          <button className="notice-accordion-button" onClick={() => setOpened(opened === notice.id ? null : notice.id)}>
            <span className="notice-number">0{index + 1}</span><span className="notice-category">{notice.category}</span><span className="notice-title">{notice.title}</span><span className="notice-date">{notice.date}</span><ChevronDown size={17} className="accordion-chevron" />
          </button>
          <AnimatePresence>{opened === notice.id && <motion.div className="notice-body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }}><p>{notice.body}</p><span>KNIGHT MELLO FAN ARCHIVE <ArrowUpRight size={12} /></span></motion.div>}</AnimatePresence>
        </article>)}
      </div>
      <p className="disclaimer-note">※ 본 사이트는 팬이 제작한 비공식 사이트이며, 공식 공지와 혼동되지 않도록 실제 정보는 공식 SNS에서 확인해 주세요.</p>
    </section>
  </motion.div>;
}
