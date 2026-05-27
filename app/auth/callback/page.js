"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "@/lib/firebase";
import { getRedirectResult, onAuthStateChanged } from "firebase/auth";

function AuthCallbackContent() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const finishLogin = async () => {
      try {
        const auth = getFirebaseAuth();
        await getRedirectResult(auth);

        const unsubscribe = onAuthStateChanged(auth, user => {
          unsubscribe();
          router.replace(user ? "/" : "/login");
          router.refresh();
        });
      } catch (error) {
        setError(error.message);
      }
    };

    finishLogin();
  }, [router]);

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", fontFamily: "sans-serif" }}>
      <h1>Signing in...</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 400, margin: "100px auto", fontFamily: "sans-serif" }}>Signing in...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
