import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
export default function NotFound() {
  return <motion.section className="not-found" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><p className="eyebrow">404 / PAGE NOT FOUND</p><h1>Oops, wrong page.</h1><p>찾으시는 페이지가 없는 것 같아요.</p><Link className="button-link" to="/">BACK TO HOME <ArrowUpRight size={15} /></Link></motion.section>;
}
