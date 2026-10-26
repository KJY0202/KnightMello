import { useState } from "react";
import { X, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageIntro from "../components/PageIntro.jsx";
import { PHOTOS } from "../data/siteData.js";

export default function Photo() {
  const [active, setActive] = useState(null);
  return <motion.div className="page inner-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <PageIntro eyebrow="VISUAL ARCHIVE" title="Photo" description="기억하고 싶은 순간들을 사진으로 기록합니다." />
    <section className="inner-content">
      <div className="list-topline"><span>PHOTO ARCHIVE</span><span>{String(PHOTOS.length).padStart(2, "0")} PHOTOS</span></div>
      <div className="photo-grid">
        {PHOTOS.map((photo, index) => <button className="photo-tile" key={photo.id} onClick={() => photo.image && setActive(photo)} style={{ "--tile-index": index }}>
          <div className="photo-tile-image">{photo.image ? <img src={photo.image} alt={photo.title} /> : <div className="photo-empty"><span>✳</span><small>PHOTO {String(index + 1).padStart(2, "0")}</small></div>}<span className="photo-tile-open"><ArrowUpRight size={16} /></span></div>
          <div className="photo-tile-meta"><span>{photo.title}</span><span>{photo.date}</span></div>
        </button>)}
      </div>
      <p className="disclaimer-note">사진 파일은 <code>public/images</code>에 넣고, PHOTOS의 <code>image</code>에 경로를 입력하세요.</p>
    </section>
    <AnimatePresence>{active && <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}><button className="lightbox-close" onClick={() => setActive(null)} aria-label="닫기"><X /></button><motion.img src={active.image} alt={active.title} initial={{ scale: .96 }} animate={{ scale: 1 }} onClick={(event) => event.stopPropagation()} /></motion.div>}</AnimatePresence>
  </motion.div>;
}
