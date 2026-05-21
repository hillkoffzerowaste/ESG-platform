"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.replace("/login");
        router.refresh();
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        await supabase.auth.signOut();
        router.replace("/login");
        router.refresh();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    check();
  }, [router]);

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
