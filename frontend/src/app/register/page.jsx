"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { JORDAN_CITIES } from "../../constants/cities";
import { User, Mail, Lock, MapPin, ImagePlus, Smartphone } from "lucide-react";
import { FaGoogle } from "react-icons/fa";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    <div className="authPage">
      <div className="authSide">
        <div className="authSideBrand">FoundIt <span>Jo</span></div>
        <div className="authSideContent">
          <h2>انضم لمجتمعنا </h2>
          <p>ساهم في إعادة المفقودات لأصحابها وكن جزءاً من منصتنا الذكية.</p>
         <img 
  src="/images/register-illustration.png"
  alt="Illustration-register" 
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
            <p>إنشاء حساب جديد</p>
          </div>

          <form onSubmit={handleSubmit} className="authForm">
            <input className="inputField" type="text" placeholder="الاسم الكامل" required 
                   onChange={(e) => setForm({...form, name: e.target.value})} />
            
            <input className="inputField" type="email" placeholder="البريد الإلكتروني" required 
                   onChange={(e) => setForm({...form, email: e.target.value})} />

            <input className="inputField" type="password" placeholder="كلمة المرور" required 
                   onChange={(e) => setForm({...form, password: e.target.value})} />

            <select className="selectField" required onChange={(e) => setForm({...form, city: e.target.value})}>
              <option value="">اختر المدينة</option>
              {JORDAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
            </select>

         
            {error && <div className="stateError">{error}</div>}

            <button className="btn btn-primary w100" type="submit" disabled={loading}>
              {loading ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
            </button>
          </form>

          <div className="authDivider">أو سجل بواسطة</div>

          <div className="authAlt">
            <button className="authAltBtn"><FaGoogle color="#DB4437" /> Google</button>
            <button className="authAltBtn"><Smartphone size={18} /> OTP</button>
          </div>

          <div className="authLink">
             لديك حساب بالفعل؟ <Link href="/login" style={{ color: "#2563eb", fontWeight: "bold" }}>تسجيل الدخول</Link>
          </div>
        </div>
      </div>
    </div>
  );
}