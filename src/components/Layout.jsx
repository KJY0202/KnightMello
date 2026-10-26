import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ArrowUpRight, Menu, X, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { NAV_ITEMS, OFFICIAL_X_URL } from "../data/siteData.js";

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="header-inner">
          <img
            src="/images/amblum.png"
            alt="Knight Mello"
            className="hero-ribbon-logo"
          />
          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="메뉴 열기"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className={`main-nav ${menuOpen ? "is-open" : ""}`}>
            {NAV_ITEMS.map((item, index) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""} ${index > 3 ? "nav-english" : ""}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <a
            className="header-social"
            href={OFFICIAL_X_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="공식 X 열기"
          >
            OFFICIAL X <ArrowUpRight size={14} />
          </a>
        </div>
      </header>

      <main key={location.pathname} className="main-content">
        {children}
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <div className="footer-wordmark">
              KNIGHT MELLO<span>®</span>
            </div>
            <p className="footer-note">A fan-made archive for Knight Mello.</p>
          </div>
          <a
            className="footer-x-button"
            href={OFFICIAL_X_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="나이트멜로 공식 X 링크"
          >
            <span className="x-mark">𝕏</span>
            <span>OFFICIAL X / TWITTER</span>
            <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="footer-bottom">
          <span>
            UNOFFICIAL FAN SITE · NOT AFFILIATED WITH OFFICIAL MANAGEMENT
          </span>
          <span>MADE BY 쫑</span>
        </div>
      </footer>
    </div>
  );
}
