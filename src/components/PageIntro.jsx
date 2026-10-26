import { motion } from "framer-motion";
export default function PageIntro({ eyebrow, title, description }) {
  return (
    <motion.section className="page-intro" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, ease: "easeOut" }}>
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p className="page-description">{description}</p>}
      <span className="intro-index">KM / ARCHIVE</span>
    </motion.section>
  );
}
