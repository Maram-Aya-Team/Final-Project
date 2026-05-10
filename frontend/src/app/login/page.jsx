"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../components/layout/MainLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(form.email, form.password);

      if (data?.status === "otp_required") {
        setError("تم إرسال رمز التحقق إلى بريدك الإلكتروني.");
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err.message || "تعذر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="authWrap">
        <Card className="authCard">
          <h1>تسجيل الدخول</h1>
          <p>أدخل بياناتك للوصول إلى حسابك.</p>

          <form onSubmit={handleSubmit} className="authForm">
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />

            {error && <div className="stateError">{error}</div>}

            <Button type="submit" disabled={loading}>
              {loading ? "جارٍ الدخول..." : "دخول"}
            </Button>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
