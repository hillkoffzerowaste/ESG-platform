"use client";

import { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(credential.user);
      alert("Check email to confirm");
      router.push("/login");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Register</h1>

      <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />

      <button onClick={register}>Sign Up</button>
    </div>
  );
}
