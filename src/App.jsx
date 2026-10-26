import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Notice from "./pages/Notice.jsx";
import Schedule from "./pages/Schedule.jsx";
import Profile from "./pages/Profile.jsx";
import Video from "./pages/Video.jsx";
import Photo from "./pages/Photo.jsx";
import NotFound from "./pages/NotFound.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/notice" element={<Notice />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/video" element={<Video />} />
            <Route path="/photo" element={<Photo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </>
  );
}
