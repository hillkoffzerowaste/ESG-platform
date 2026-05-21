"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const redirectIfLoggedIn = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace("/");
        router.refresh();
      }
    };

    redirectIfLoggedIn();
  }, [router]);

  const handleLogin = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setError("Login สำเร็จไม่ครบถ้วน กรุณาตรวจสอบว่าอีเมลยืนยันแล้วหรือยัง");
      setLoading(false);
      return;
    }

    router.replace("/");
    router.refresh();
    window.location.assign("/");
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      const message = error.message.includes("Unsupported provider")
        ? "ยังไม่ได้เปิด Google provider ใน Supabase Auth"
        : error.message;
      setError(message);
      setLoading(false);
      return;
    }

    if (!data?.url) {
      setError("Supabase ไม่ได้ส่ง URL สำหรับ Google login กลับมา");
      setLoading(false);
      return;
    }

    window.location.assign(data.url);
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h1>Login</h1>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        style={{ marginTop: 12 }}
      >
        Continue with Google
      </button>

      {error && (
        <p style={{ color: "red", marginTop: 10 }}>{error}</p>
      )}
    </div>
  );
}
