"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  useEffect(() => {
    const finishLogin = async () => {
      const code = searchParams.get("code");

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      router.replace(data.session ? "/" : "/login");
      router.refresh();
    };

    finishLogin();
  }, [router, searchParams]);

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", fontFamily: "sans-serif" }}>
      <h1>กำลังเข้าสู่ระบบ...</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div style={{ maxWidth: 400, margin: "100px auto", fontFamily: "sans-serif" }}>กำลังเข้าสู่ระบบ...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
