"use client";

import { useEffect, useState } from "react";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, user => {
        if (user) {
          router.replace("/");
          router.refresh();
        }
      });
    } catch (error) {
      setError(error.message);
    }

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (event) => {
    event?.preventDefault();
    setLoading(true);
    setError("");

    try {
      const auth = getFirebaseAuth();
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/");
      router.refresh();
      window.location.assign("/");
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const auth = getFirebaseAuth();
      await signInWithPopup(auth, getGoogleProvider());
      router.replace("/");
      router.refresh();
      window.location.assign("/");
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
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
