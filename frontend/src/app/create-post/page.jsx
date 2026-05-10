"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "../../components/layout/MainLayout";
import { createPost } from "../../services/postService";

export default function CreatePostPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    type: "lost",
    title: "",
    description: "",
    category: "",
    city: "",
    area: "",
    address: "",
    itemDate: "",
    contactPhone: "",
    reward: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const postData = {
        type: form.type,
        title: form.title,
        description: form.description,
        category: form.category,
        city: form.city,
        area: form.area,
        location: {
          address: form.address,
        },
        itemDate: form.itemDate,
        contactPhone: form.contactPhone,
        reward: form.type === "found" ? 0 : Number(form.reward || 0),
        images: [],
      };

      await createPost(postData);

      router.push("/");
    } catch (err) {
      setError(err.message || "تعذر إنشاء المنشور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="pageHeader">
        <h1>إنشاء منشور جديد</h1>
        <p>أضف تفاصيل الغرض المفقود أو الموجود.</p>
      </section>

      <form className="card createPostForm" onSubmit={handleSubmit}>
        {error && <div className="stateError">{error}</div>}

        <select
          className="inputField"
          value={form.type}
          onChange={(e) => updateField("type", e.target.value)}
        >
          <option value="lost">مفقود</option>
          <option value="found">موجود</option>
        </select>

        <input
          className="inputField"
          placeholder="العنوان"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          required
        />

        <textarea
          className="inputField"
          placeholder="الوصف"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          required
          rows={5}
        />

        <input
          className="inputField"
          placeholder="المدينة مثل Amman"
          value={form.city}
          onChange={(e) => updateField("city", e.target.value)}
          required
        />

        <input
          className="inputField"
          placeholder="المنطقة"
          value={form.area}
          onChange={(e) => updateField("area", e.target.value)}
          required
        />

        <input
          className="inputField"
          placeholder="العنوان التفصيلي"
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
          required
        />

        <input
          className="inputField"
          type="date"
          value={form.itemDate}
          onChange={(e) => updateField("itemDate", e.target.value)}
          required
        />

        <input
          className="inputField"
          placeholder="رقم التواصل"
          value={form.contactPhone}
          onChange={(e) => updateField("contactPhone", e.target.value)}
        />

        {form.type === "lost" && (
          <div className="formGroup">

  <label className="formLabel">
    قيمة المكافأة (اختياري)
  </label>

  <input
    className="inputField"
    type="number"
    min="0"
    placeholder="أدخل قيمة المكافأة"
    value={form.reward}
    onChange={(e) =>
      updateField(
        "reward",
        Math.max(0, Number(e.target.value))
      )
    }
  />

</div>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "جاري الإنشاء..." : "إنشاء المنشور"}
        </button>
      </form>
    </MainLayout>
  );
}