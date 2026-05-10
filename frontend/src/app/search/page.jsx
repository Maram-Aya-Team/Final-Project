"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import MainLayout from "../../components/layout/MainLayout";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

import { JORDAN_CITIES } from "../../constants/cities";
import { normalizePost } from "../../utils/normalizePost";

const demoPosts = [
  {
    _id: "demo-1",
    type: "lost",
    title: "مفاتيح سيارة مفقودة",
    description: "مفقودة بالقرب من الجامعة، عليها علاقة زرقاء.",
    city: "Amman",
    area: "Jubeiha",
    category: "Keys",
    images: [],
    user: { name: "أحمد", avatar: null },
    likes: 3,
    commentsCount: 1,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-2",
    type: "found",
    title: "حقيبة سوداء موجودة",
    description: "تم العثور على حقيبة سوداء بالقرب من مول.",
    city: "Irbid",
    area: "Center",
    category: "Bag",
    images: [],
    user: { name: "سارة", avatar: null },
    likes: 5,
    commentsCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-3",
    type: "lost",
    title: "هاتف iPhone مفقود",
    description: "اللون أبيض ويوجد عليه كفر شفاف.",
    city: "Zarqa",
    area: "الزرقاء الجديدة",
    category: "Phone",
    images: [],
    user: { name: "ليان", avatar: null },
    likes: 4,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-4",
    type: "found",
    title: "ساعة يد موجودة",
    description: "ساعة فضية تم العثور عليها في الحديقة.",
    city: "Amman",
    area: "المدينة الرياضية",
    category: "Watch",
    images: [],
    user: { name: "محمد", avatar: null },
    likes: 2,
    commentsCount: 1,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-5",
    type: "lost",
    title: "محفظة بنية",
    description: "بداخلها بطاقات شخصية.",
    city: "Aqaba",
    area: "وسط البلد",
    category: "Wallet",
    images: [],
    user: { name: "نور", avatar: null },
    likes: 1,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-6",
    type: "found",
    title: "سماعات AirPods",
    description: "تم العثور عليها داخل باص.",
    city: "Amman",
    area: "صويلح",
    category: "Electronics",
    images: [],
    user: { name: "خالد", avatar: null },
    likes: 7,
    commentsCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-7",
    type: "lost",
    title: "بطاقة جامعية",
    description: "بطاقة جامعة العلوم والتكنولوجيا.",
    city: "Irbid",
    area: "الجامعة",
    category: "Documents",
    images: [],
    user: { name: "رغد", avatar: null },
    likes: 0,
    commentsCount: 1,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-8",
    type: "found",
    title: "نظارات شمسية",
    description: "سوداء اللون من ماركة RayBan.",
    city: "Madaba",
    area: "الشارع الرئيسي",
    category: "Accessories",
    images: [],
    user: { name: "يوسف", avatar: null },
    likes: 2,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-9",
    type: "lost",
    title: "حقيبة لابتوب",
    description: "تحتوي على أوراق مهمة.",
    city: "Salt",
    area: "وسط السلط",
    category: "Laptop",
    images: [],
    user: { name: "رامي", avatar: null },
    likes: 3,
    commentsCount: 3,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-10",
    type: "found",
    title: "مفتاح منزل",
    description: "تم العثور عليه قرب الكافيه.",
    city: "Jerash",
    area: "جرش القديمة",
    category: "Keys",
    images: [],
    user: { name: "هديل", avatar: null },
    likes: 1,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-11",
    type: "lost",
    title: "جواز سفر",
    description: "الاسم على الجواز محمد علي.",
    city: "Amman",
    area: "عبدون",
    category: "Documents",
    images: [],
    user: { name: "محمد", avatar: null },
    likes: 6,
    commentsCount: 4,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-12",
    type: "found",
    title: "شاحن لابتوب",
    description: "شاحن HP تم العثور عليه بالمكتبة.",
    city: "Irbid",
    area: "شارع الجامعة",
    category: "Electronics",
    images: [],
    user: { name: "لانا", avatar: null },
    likes: 2,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-13",
    type: "lost",
    title: "سلسلة ذهبية",
    description: "مفقودة أثناء مناسبة عائلية.",
    city: "Karak",
    area: "الكرك",
    category: "Jewelry",
    images: [],
    user: { name: "ريم", avatar: null },
    likes: 8,
    commentsCount: 2,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-14",
    type: "found",
    title: "بطاقة بنكية",
    description: "تم العثور عليها داخل ATM.",
    city: "Amman",
    area: "الدوار السابع",
    category: "Cards",
    images: [],
    user: { name: "آية", avatar: null },
    likes: 4,
    commentsCount: 1,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-15",
    type: "lost",
    title: "كاميرا كانون",
    description: "داخل حقيبة سوداء صغيرة.",
    city: "Aqaba",
    area: "الشاطئ الجنوبي",
    category: "Camera",
    images: [],
    user: { name: "زين", avatar: null },
    likes: 5,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-16",
    type: "found",
    title: "قطة ضائعة",
    description: "قطة بيضاء صغيرة تم العثور عليها.",
    city: "Amman",
    area: "تلاع العلي",
    category: "Pets",
    images: [],
    user: { name: "دانا", avatar: null },
    likes: 11,
    commentsCount: 5,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-17",
    type: "lost",
    title: "سوار فضي",
    description: "مفقود في مول عمان.",
    city: "Amman",
    area: "مول عمان",
    category: "Jewelry",
    images: [],
    user: { name: "جود", avatar: null },
    likes: 2,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-18",
    type: "found",
    title: "دفتر ملاحظات",
    description: "عليه اسم هند.",
    city: "Mafraq",
    area: "الجامعة",
    category: "Books",
    images: [],
    user: { name: "حسن", avatar: null },
    likes: 1,
    commentsCount: 1,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-19",
    type: "lost",
    title: "حذاء رياضي",
    description: "تم فقدانه بعد التمرين بالنادي.",
    city: "Irbid",
    area: "النادي الرياضي",
    category: "Clothes",
    images: [],
    user: { name: "ميرا", avatar: null },
    likes: 0,
    commentsCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "demo-20",
    type: "found",
    title: "تابلت سامسونج",
    description: "تم العثور عليه في مطعم.",
    city: "Amman",
    area: "الجاردنز",
    category: "Tablet",
    images: [],
    user: { name: "كريم", avatar: null },
    likes: 6,
    commentsCount: 3,
    createdAt: new Date().toISOString(),
  },
];

export default function SearchPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: "",
    city: "",
    type: "",
  });

  useEffect(() => {
    setPosts([]);
    setLoading(false);
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const loadPosts = () => {
    setLoading(true);

    setTimeout(() => {
      const normalized = demoPosts.map(normalizePost);
      const keyword = filters.keyword.trim().toLowerCase();

      const filtered = normalized.filter((post) => {
        const text = `
          ${post.title || ""}
          ${post.description || ""}
          ${post.city || ""}
          ${post.area || ""}
          ${post.category || ""}
          ${post.type || ""}
        `.toLowerCase();

        const matchesKeyword = keyword === "" || text.includes(keyword);
        const matchesCity = filters.city === "" || post.city === filters.city;
        const matchesType = filters.type === "" || post.type === filters.type;

        return matchesKeyword && matchesCity && matchesType;
      });

      setPosts(filtered);
      setLoading(false);
    }, 200);
  };

  return (
    <MainLayout>
      <section className="pageHeader">
        <h1>البحث</h1>
        <p>فلترة دقيقة للوصول إلى المنشورات المطلوبة بسرعة.</p>
      </section>

      <Card>
        <div className="searchFilters">
          <Input
            placeholder="عنوان أو وصف"
            value={filters.keyword}
            onChange={(e) => updateFilter("keyword", e.target.value)}
          />

          <Select
            value={filters.city}
            onChange={(e) => updateFilter("city", e.target.value)}
            options={[
              { label: "كل المدن", value: "" },
              ...JORDAN_CITIES.map((city) => ({
                label: city,
                value: city,
              })),
            ]}
          />

          <Select
            value={filters.type}
            onChange={(e) => updateFilter("type", e.target.value)}
            options={[
              { label: "كل الأنواع", value: "" },
              { label: "مفقود", value: "lost" },
              { label: "موجود", value: "found" },
            ]}
          />

          <Button type="button" onClick={loadPosts}>
            تطبيق
          </Button>
        </div>
      </Card>

      {loading ? (
        <div className="postGrid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeletonCard" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="stateEmpty">لا توجد نتائج مطابقة</div>
      ) : (
        <div className="postGrid">
          {posts.map((post) => (
            <Card key={post._id} className="postCard">
              <div className="postTop">
                <h3>{post.title}</h3>

                <Badge variant={post.type === "lost" ? "danger" : "success"}>
                  {post.type === "lost" ? "مفقود" : "موجود"}
                </Badge>
              </div>

              <p>{post.description}</p>

              <div className="postMeta">
                <span>{post.city}</span>
                <span>{post.area}</span>
                <span>{post.category}</span>
              </div>

              <Link href={`/posts/${post._id}`} className="postLink">
                عرض التفاصيل
              </Link>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
}