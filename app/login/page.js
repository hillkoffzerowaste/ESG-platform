"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase";
import { hasOtpClaim, requestOtpForUser, verifyOtpForUser } from "@/lib/otpClient";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";

function getFriendlyAuthError(error) {
  if (error?.code === "auth/unauthorized-domain") {
    return [
      "Firebase has not authorized this domain for Google login.",
      "Open Firebase Console > Authentication > Settings > Authorized domains and add the domain currently opening this app.",
      "Examples: localhost, esg-hillkoff.web.app, esg-hillkoff.firebaseapp.com, or your custom production domain."
    ].join(" ");
  }

  if (error?.message?.startsWith("Cannot reach")) {
    return `${error.message} If this is production, deploy Firebase Functions first.`;
  }

  return error?.message || "Login failed";
}

export default function LoginPage() {
  const router = useRouter();
  const autoOtpSentRef = useRef(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("google");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const sendOtp = useCallback(async (user) => {
    const targetUser = user || firebaseUser;
    if (!targetUser) throw new Error("Please sign in with Google first.");

    const result = await requestOtpForUser(targetUser);
    setFirebaseUser(targetUser);
    setStep("otp");
    setNotice(`OTP sent to ${result.email}. It expires in 5 minutes.`);
    return result;
  }, [firebaseUser]);

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, async user => {
        if (!user) return;
        setFirebaseUser(user);

        if (await hasOtpClaim(user)) {
          router.replace("/");
          router.refresh();
          return;
        }

        setStep("otp");
        if (autoOtpSentRef.current) return;

        autoOtpSentRef.current = true;
        setLoading(true);
        setError("");

        try {
          await sendOtp(user);
        } catch (error) {
          setNotice(`Signed in as ${user.email}. Please resend the OTP to continue.`);
          setError(getFriendlyAuthError(error));
        } finally {
          setLoading(false);
        }
      });
    } catch (error) {
      setError(getFriendlyAuthError(error));
    }

    return () => unsubscribe();
  }, [router, sendOtp]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    setNotice("");

    try {
      const auth = getFirebaseAuth();
      const credential = await signInWithPopup(auth, getGoogleProvider());
      setFirebaseUser(credential.user);

      if (!(await hasOtpClaim(credential.user)) && !autoOtpSentRef.current) {
        autoOtpSentRef.current = true;
        await sendOtp(credential.user);
      }
    } catch (error) {
      setError(getFriendlyAuthError(error));
      try {
        await signOut(getFirebaseAuth());
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await verifyOtpForUser(firebaseUser, otp);
      router.replace("/");
      router.refresh();
      window.location.assign("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");

    try {
      await sendOtp();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f8fafc" }}>
      <div style={{ width: "100%", maxWidth: 420, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, boxShadow: "0 12px 36px rgba(15,23,42,.08)" }}>
        <h1 style={{ margin: 0, color: "#14532d", fontSize: 26 }}>Hillkoff ESG Login</h1>
        <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
          Sign in with your Google account, then verify the OTP sent to your @hillkoff.com email.
        </p>

        {step === "google" && (
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{ width: "100%", padding: 12, border: "none", borderRadius: 8, background: "#166534", color: "#fff", fontWeight: 800, cursor: "pointer" }}
          >
            {loading ? "Signing in..." : "Continue with Google"}
          </button>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} style={{ display: "grid", gap: 12 }}>
            <input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={event => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit OTP"
              required
              style={{ width: "100%", boxSizing: "border-box", padding: 12, border: "1px solid #cbd5e1", borderRadius: 8, fontSize: 18, letterSpacing: 2, textAlign: "center" }}
            />
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              style={{ width: "100%", padding: 12, border: "none", borderRadius: 8, background: "#166534", color: "#fff", fontWeight: 800, cursor: "pointer", opacity: loading || otp.length !== 6 ? .65 : 1 }}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              style={{ width: "100%", padding: 10, border: "1px solid #bbf7d0", borderRadius: 8, background: "#f0fdf4", color: "#166534", fontWeight: 700, cursor: "pointer" }}
            >
              Resend OTP
            </button>
          </form>
        )}

        {notice && <p style={{ color: "#166534", fontSize: 13, marginTop: 14 }}>{notice}</p>}
        {error && <p style={{ color: "#b91c1c", fontSize: 13, marginTop: 14 }}>{error}</p>}
      </div>
    </div>
  );
}
