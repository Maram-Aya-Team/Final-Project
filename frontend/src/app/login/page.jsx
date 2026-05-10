"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff, Smartphone } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/");
    } catch (err) {
      setError(err.message || "تعذر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      {/* القسم الملون - خلفية زرقاء */}
      <div className="authSide">
        <div className="authSideBrand">FoundIt <span>Jo</span></div>
        <div className="authSideContent">
          <h2>مرحباً بك مجدداً</h2>
          <p>سجل دخولك للوصول إلى مفقوداتك ومتابعة آخر التحديثات.</p>
          <img
            src="/images/login-illustration.png"
            alt="Illustration"
            className="authIllustration"
          />
        </div>
      </div>

    <div className="authMain" style={{ 
          backgroundColor: "#ffffff",
          borderTopRightRadius: "60px", 
          borderBottomRightRadius: "60px",
          marginRight: "-60px", 
          paddingRight: "60px", 
          zIndex: 10,
          position: "relative"
      }}>

        <div className="authCard" style={{ boxShadow: "none" }}>
          <div className="authCardHeader">
            <h1>FoundIt <span style={{ color: "#2563eb" }}>Jo</span></h1>
            <p>أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          <form onSubmit={handleSubmit} className="authForm">
            <input
              className="inputField"
              type="email"
              placeholder="البريد الإلكتروني"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <div style={{ position: 'relative' }}>
              <input
                className="inputField"
                type={showPw ? "text" : "password"}
                placeholder="كلمة المرور"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="inputToggle"
                style={{ top: "12px" }}
              >
                {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div style={{ textAlign: "left", marginBottom: "15px" }}>
              <Link href="/forgot-password" className="forgotLink">نسيت كلمة المرور؟</Link>
            </div>

            {error && <div className="stateError">{error}</div>}

            <button className="btn btn-primary w100" type="submit" disabled={loading}>
              {loading ? "جارٍ التحميل..." : "تسجيل الدخول"}
            </button>
          </form>

          <div className="authDivider">أو سجل بواسطة</div>

          <div className="authAlt">
            <button className="authAltBtn"><FaGoogle color="#DB4437" /> Google</button>
            <button className="authAltBtn"><Smartphone size={18} /> OTP</button>
          </div>

          <div className="authLink">
            ليس لديك حساب؟ <Link href="/register" style={{ color: "#2563eb" }}>أنشئ حساباً جديداً</Link>
          </div>
        </div>
      </div>
    </div>
  );
}