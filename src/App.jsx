import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import Admin from "./pages/Admin.jsx";

const Notice = lazy(() => import("./pages/Notice.jsx"));
const Schedule = lazy(() => import("./pages/Schedule.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Video = lazy(() => import("./pages/Video.jsx"));
const Photo = lazy(() => import("./pages/Photo.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const lazyPage = (Page) => (
  <Suspense fallback={null}>
    <Page />
  </Suspense>
);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

export default function App() {
  const location = useLocation();

  const publicRoutes = (
    <Layout>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/notice" element={lazyPage(Notice)} />
        <Route path="/schedule" element={lazyPage(Schedule)} />
        <Route path="/profile" element={lazyPage(Profile)} />
        <Route path="/video" element={lazyPage(Video)} />
        <Route path="/photo" element={lazyPage(Photo)} />
        <Route path="*" element={lazyPage(NotFound)} />
      </Routes>
    </Layout>
  );

  return (
    <>
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={publicRoutes} />
        </Routes>
      </AnimatePresence>
    </>
  );
}
