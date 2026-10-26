import { motion } from "framer-motion";
import PageIntro from "../components/PageIntro.jsx";
import MediaCard from "../components/MediaCard.jsx";
import { VIDEOS } from "../data/siteData.js";

export default function Video() {
  return <motion.div className="page inner-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <PageIntro eyebrow="PLAY IT BACK" title="Video" description="무대와 영상 기록을 모아보는 비디오 아카이브." />
    <section className="inner-content">
      <div className="list-topline"><span>VIDEO ARCHIVE</span><span>{String(VIDEOS.length).padStart(2, "0")} CLIPS</span></div>
      <div className="media-grid media-grid-page">{VIDEOS.map((item, index) => <MediaCard key={item.id} item={item} index={index} />)}</div>
      <p className="disclaimer-note">영상 링크와 썸네일은 <code>src/data/siteData.js</code>의 VIDEOS 항목에서 설정할 수 있습니다.</p>
    </section>
  </motion.div>;
}
