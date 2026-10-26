import { motion } from "framer-motion";
import PageIntro from "../components/PageIntro.jsx";
import Calendar from "../components/Calendar.jsx";

export default function Schedule() {
  return <motion.div className="page inner-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <PageIntro eyebrow="DATES TO REMEMBER" title="Schedule" description="다가오는 무대와 이벤트를 한눈에 확인하세요." />
    <section className="inner-content schedule-page-content">
      <div className="schedule-caption"><span>LIVE / EVENT CALENDAR</span><span>DATES MAY CHANGE · CHECK OFFICIAL SNS</span></div>
      <Calendar />
    </section>
  </motion.div>;
}
