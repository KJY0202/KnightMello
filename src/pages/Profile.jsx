import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import PageIntro from "../components/PageIntro.jsx";
import { MEMBERS } from "../data/siteData.js";

export default function Profile() {
  return (
    <motion.div
      className="page inner-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <PageIntro
        eyebrow="MEET THE MEMBERS"
        title="Profile"
        description="네 가지 색, 서로 다른 매력. 나이트멜로의 멤버들을 소개합니다."
      />
      <section className="inner-content">
        <div className="profile-grid">
          {MEMBERS.map((member, index) => (
            <motion.article
              className="profile-card"
              key={member.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div
                className="profile-photo"
                style={{ "--member-color": member.color }}
              >
                {member.image ? (
                  <img src={member.image} alt={member.nameKo} />
                ) : (
                  <div className="profile-photo-empty">
                    <span>{member.name.slice(0, 1)}</span>
                    <small>PHOTO TO BE ADDED</small>
                  </div>
                )}
                <span className="profile-count">0{index + 1}</span>
                <span className="profile-color-dot" />
              </div>
              <div className="profile-card-bottom">
                <div>
                  <p className="eyebrow">{member.role} / KNIGHT MELLO</p>
                  <h2>{member.name}</h2>
                  <p className="member-korean">{member.nameKo}</p>
                </div>
                <span
                  className="member-color"
                  style={{ background: member.color }}
                />
              </div>
              <p className="member-bio">{member.bio}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
