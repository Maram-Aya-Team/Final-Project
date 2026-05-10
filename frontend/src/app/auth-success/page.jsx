"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      router.push("/");
    } else {
      router.push("/login");
    }
  }, [router, searchParams]);

  return <p>جاري تسجيل الدخول...</p>;
}