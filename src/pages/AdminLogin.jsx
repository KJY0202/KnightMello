import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError("로그인에 실패했어요. 이메일과 비밀번호를 확인해 주세요.");
      setLoading(false);
      return;
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (adminError || !isAdmin) {
      await supabase.auth.signOut();
      setError("관리자 권한이 없는 계정이에요.");
      setLoading(false);
      return;
    }

    navigate("/admin");
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <p className="eyebrow">KNIGHT MELLO ARCHIVE</p>
        <h1>관리자 로그인</h1>
        <p>특별 의상 및 라이브 정보를 관리할 수 있어요.</p>

        <form onSubmit={handleLogin}>
          <label htmlFor="admin-email">이메일</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password">비밀번호</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && <p className="admin-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <Link to="/" className="admin-back-link">
          ← 사이트로 돌아가기
        </Link>
      </section>
    </main>
  );
}
