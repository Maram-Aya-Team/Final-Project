"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthSuccessContent() {
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

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<p>جاري تسجيل الدخول...</p>}>
      <AuthSuccessContent />
    </Suspense>
  );
}
