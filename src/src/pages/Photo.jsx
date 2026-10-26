import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import PageIntro from "../components/PageIntro.jsx";
import { PHOTOS } from "../data/siteData.js";

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.075 } },
};

const tileVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Photo() {
  const [activeIndex, setActiveIndex] = useState(-1);
  const availablePhotos = useMemo(() => PHOTOS.filter((photo) => Boolean(photo.image)), []);
  const activePhoto = activeIndex >= 0 ? availablePhotos[activeIndex] : null;
  const closeLightbox = () => setActiveIndex(-1);

  const showPrevious = () => {
    setActiveIndex((current) =>
      current <= 0 ? availablePhotos.length - 1 : current - 1,
    );
  };

  const showNext = () => {
    setActiveIndex((current) =>
      current >= availablePhotos.length - 1 ? 0 : current + 1,
    );
  };

  useEffect(() => {
    if (activeIndex < 0 || availablePhotos.length === 0) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft" && availablePhotos.length > 1) showPrevious();
      if (event.key === "ArrowRight" && availablePhotos.length > 1) showNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
    // The lightbox stays open while activeIndex changes; keep one keyboard listener alive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex >= 0, availablePhotos.length]);

  return (
    <motion.div
      className="page inner-page photo-page-upgraded"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35 }}
    >
      <PageIntro
        eyebrow="VISUAL ARCHIVE"
        title="Photo"
        description="기억하고 싶은 순간들을 사진으로 기록합니다."
      />

      <section className="inner-content photo-content-upgraded">
        <div className="photo-archive-toolbar">
          <div className="list-topline">
            <span>PHOTO ARCHIVE</span>
            <span>{String(availablePhotos.length).padStart(2, "0")} PHOTOS</span>
          </div>
          <p>사진을 누르면 크게 볼 수 있어요.</p>
        </div>

        <motion.div
          className="photo-grid photo-grid-upgraded"
          variants={gridVariants}
          initial="hidden"
          animate="visible"
        >
          {PHOTOS.map((photo, index) => {
            const availableIndex = availablePhotos.findIndex((item) => item.id === photo.id);
            const hasImage = Boolean(photo.image);

            return (
              <motion.button
                className={`photo-tile photo-tile-upgraded ${hasImage ? "has-photo" : "is-placeholder"}`}
                key={photo.id}
                type="button"
                disabled={!hasImage}
                onClick={() => hasImage && setActiveIndex(availableIndex)}
                variants={tileVariants}
                whileHover={hasImage ? { y: -5 } : undefined}
                whileTap={hasImage ? { scale: 0.985 } : undefined}
                transition={{ duration: 0.28, ease: "easeOut" }}
                aria-label={hasImage ? `${photo.title} 크게 보기` : `${photo.title}, 사진 준비 중`}
              >
                <div className="photo-tile-image photo-tile-image-upgraded">
                  {hasImage ? (
                    <img src={photo.image} alt={photo.title} loading="lazy" />
                  ) : (
                    <div className="photo-empty photo-empty-upgraded">
                      <span><ImageIcon size={25} strokeWidth={1.4} /></span>
                      <small>PHOTO {String(index + 1).padStart(2, "0")}</small>
                      <em>COMING SOON</em>
                    </div>
                  )}
                  {hasImage && (
                    <span className="photo-tile-open"><ArrowUpRight size={16} /></span>
                  )}
                  <span className="photo-tile-number">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="photo-tile-meta photo-tile-meta-upgraded">
                  <span>{photo.title}</span>
                  <span>{photo.date}</span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {availablePhotos.length === 0 ? (
          <motion.div
            className="photo-empty-note"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <span>✳</span>
            <p>아직 등록된 사진이 없어요.</p>
            <small>사진 파일을 <code>public/images</code>에 넣고 <code>src/data/siteData.js</code>의 PHOTOS에 경로를 추가하면 여기에 표시됩니다.</small>
          </motion.div>
        ) : (
          <p className="disclaimer-note">사진을 좌우 화살표 또는 키보드 ← → 로 넘길 수 있어요. ESC를 누르면 닫힙니다.</p>
        )}
      </section>

      <AnimatePresence>
        {activePhoto && (
          <motion.div
            className="lightbox lightbox-upgraded"
            role="dialog"
            aria-modal="true"
            aria-label={`${activePhoto.title} 사진 보기`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLightbox}
          >
            <button
              className="lightbox-close"
              type="button"
              onClick={(event) => { event.stopPropagation(); closeLightbox(); }}
              aria-label="사진 닫기"
            >
              <X size={22} />
            </button>

            {availablePhotos.length > 1 && (
              <>
                <button
                  className="lightbox-nav lightbox-prev"
                  type="button"
                  onClick={(event) => { event.stopPropagation(); showPrevious(); }}
                  aria-label="이전 사진"
                >
                  <ArrowLeft size={23} />
                </button>
                <button
                  className="lightbox-nav lightbox-next"
                  type="button"
                  onClick={(event) => { event.stopPropagation(); showNext(); }}
                  aria-label="다음 사진"
                >
                  <ArrowRight size={23} />
                </button>
              </>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                className="lightbox-content"
                key={activePhoto.id}
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.985, y: -4 }}
                transition={{ duration: 0.22 }}
                onClick={(event) => event.stopPropagation()}
              >
                <img src={activePhoto.image} alt={activePhoto.title} />
                <div className="lightbox-caption">
                  <div>
                    <span>KNIGHT MELLO / PHOTO ARCHIVE</span>
                    <strong>{activePhoto.title}</strong>
                  </div>
                  <div className="lightbox-caption-meta">
                    <span>{activePhoto.date}</span>
                    <span>{String(activeIndex + 1).padStart(2, "0")} / {String(availablePhotos.length).padStart(2, "0")}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
