import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import PageIntro from "../components/PageIntro.jsx";
import { MEMBERS } from "../data/siteData.js";

const COLOR_NAMES = {
  emo: "보라색",
  pareo: "노란색",
  popa: "민트 그린",
  saetbyeol: "화이트",
};

export default function ProfileDetail() {
  const { memberId } = useParams();
  const member = MEMBERS.find((item) => item.id === memberId);

  if (!member) {
    return (
      <motion.div
        className="page inner-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <PageIntro
          eyebrow="MEMBER NOT FOUND"
          title="Profile"
          description="해당 멤버의 프로필을 찾을 수 없습니다."
        />
        <div className="inner-content">
          <Link to="/profile" className="member-back-link">
            <ArrowLeft size={17} />
            멤버 목록으로 돌아가기
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="page inner-page member-detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      style={{ "--member-color": member.color }}
    >
      <PageIntro
        eyebrow="MEET THE MEMBERS"
        title="Profile"
        description="나이트멜로의 멤버를 소개합니다."
      />

      <section className="inner-content">
        <Link to="/profile" className="member-back-link">
          <ArrowLeft size={17} />
          전체 멤버
        </Link>

        <div className="member-detail">
          <motion.div
            className="member-detail-photo"
            initial={{ opacity: 0, x: -28, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {member.image ? (
              <img src={member.image} alt={member.nameKo} />
            ) : (
              <div className="member-detail-photo-empty">
                <span>{member.nameKo}</span>
                <small>PHOTO TO BE ADDED</small>
              </div>
            )}
          </motion.div>

          <motion.div
            className="member-detail-info"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.18,
                },
              },
            }}
          >
            <motion.p
              className="member-detail-eyebrow"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              KNIGHT MELLO
              <span className="member-detail-color-dot" />
              MEMBER PROFILE
            </motion.p>

            <motion.div
              className="member-detail-name"
              variants={{
                hidden: { opacity: 0, y: 18 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.55 }}
            >
              <h1>{member.nameKo}</h1>
              <p lang="ja">{member.name}</p>
            </motion.div>

            <motion.div
              className="member-detail-divider"
              variants={{
                hidden: { opacity: 0, scaleX: 0 },
                visible: { opacity: 1, scaleX: 1 },
              }}
              transition={{ duration: 0.5 }}
            />

            <motion.div
              className="member-detail-field"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <span className="member-detail-label">BIRTHDAY</span>
              <p>정보 확인 중</p>
            </motion.div>

            <motion.div
              className="member-detail-field"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <span className="member-detail-label">MEMBER COLOR</span>

              <div className="member-detail-color">
                <span className="member-detail-color-swatch" />
                <div>
                  <p>{COLOR_NAMES[member.id] ?? "정보 확인 중"}</p>
                  <span>{member.color.toUpperCase()}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="member-detail-footer"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <span>DIFFERENT COLORS, ONE MELODY.</span>
              <ArrowUpRight size={18} />
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="member-detail-bottom"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.5 }}
        >
          <span>
            {member.nameKo} <span lang="ja">/ {member.name}</span>
          </span>
          <Link to="/profile">
            다른 멤버 보기 <ArrowUpRight size={16} />
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
}
