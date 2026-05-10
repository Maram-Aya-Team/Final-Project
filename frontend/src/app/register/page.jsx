"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../components/layout/MainLayout";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import { JORDAN_CITIES } from "../../constants/cities";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      router.push("/");
    } catch (err) {
      setError(err.message || "تعذر إنشاء الحساب");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="authWrap">
        <Card className="authCard">
          <h1>إنشاء حساب</h1>
          <p>ابدأ باستخدام FounIt JO بخطوات بسيطة.</p>

          <form onSubmit={handleSubmit} className="authForm">
            <Input
              type="text"
              placeholder="الاسم الكامل"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="البريد الإلكتروني"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="كلمة المرور"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
            />
            <Select
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              options={[
                { label: "اختر المدينة", value: "" },
                ...JORDAN_CITIES.map((city) => ({ label: city, value: city })),
              ]}
              required
            />

            {error && <div className="stateError">{error}</div>}

            <Button type="submit" disabled={loading}>
              {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
            </Button>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
