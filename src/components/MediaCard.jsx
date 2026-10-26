import { ArrowUpRight, Play } from "lucide-react";
export default function MediaCard({ item, type = "video", index = 0 }) {
  const isVideo = type === "video";
  const image = isVideo ? item.thumbnail : item.image;
  const content = (
    <>
      <div className={`media-image ${image ? "has-image" : ""}`}>
        {image ? <img src={image} alt={item.title} /> : <div className={`media-placeholder ${isVideo ? "video-placeholder" : "photo-placeholder"}`}>
          <span className="placeholder-mark">{isVideo ? "▶" : "✳"}</span><span>{isVideo ? "VIDEO ARCHIVE" : "PHOTO ARCHIVE"}</span>
        </div>}
        <span className="media-index">0{index + 1}</span>
        <span className="media-action">{isVideo ? <Play size={16} fill="currentColor" /> : <ArrowUpRight size={17} />}</span>
      </div>
      <div className="media-meta"><span>{item.category || (isVideo ? "PHOTO LOG" : "ARCHIVE")}</span><span>{item.date}</span></div>
      <h3 className="media-title">{item.title}</h3>
    </>
  );
  return isVideo && item.url ? <a className="media-card" href={item.url} target="_blank" rel="noreferrer">{content}</a> : <article className="media-card">{content}</article>;
}
