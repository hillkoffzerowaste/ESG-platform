"use client";

import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const auth = getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, user => {
        if (!user) {
          router.replace("/login");
          router.refresh();
        }
        setLoading(false);
      });
    } catch {
      router.replace("/login");
      router.refresh();
      setLoading(false);
    }

    return () => unsubscribe();
  }, [router]);

  const logout = async () => {
    const auth = getFirebaseAuth();
    await signOut(auth);
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
