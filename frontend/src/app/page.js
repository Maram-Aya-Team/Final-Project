"use client";

import { useMemo } from "react";
import MainLayout from "../components/layout/MainLayout";
import { normalizePost } from "../utils/normalizePost";
import { useAuth } from "../context/AuthContext";

import {
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Send,
  Eye,
  UserCircle,
} from "lucide-react";

const PostCard = ({ post }) => {
  const isLost = post.type === "lost";

  return (
    <article className="singlePostCard">
      <div className="postHeader">
        <div className="postUser">
          <div className="postAvatar">
            {post.user?.avatar ? (
              <img src={post.user.avatar} alt="avatar" />
            ) : (
              <UserCircle size={34} color="#94a3b8" />
            )}
          </div>

          <div>
            <h4 className="postUserName">
              {post.user?.name || "مستخدم FoundIt"}
            </h4>

            <div className="postDate">
              <Calendar size={13} />

              <span>
                {new Date(post.createdAt).toLocaleDateString("ar-JO", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        <span className={`typeBadge ${isLost ? "bg-danger" : "bg-success"}`}>
          {isLost ? "🔴 مفقود" : "🟢 موجود"}
        </span>
      </div>

      <div className="postImageContainer">
        {post.images?.[0] ? (
          <img src={post.images[0]} alt={post.title} />
        ) : (
          <div className="postNoImage">
            <Eye size={48} color="#cbd5e1" />
            <span>لا توجد صورة</span>
          </div>
        )}
      </div>

      <div className="postContent">
        <h3 className="postTitle">{post.title}</h3>

        <p className="postDescription">{post.description}</p>

        <div className="postMeta">
          <span className="metaChip">
            <MapPin size={14} />
            {post.city || "عمان"}
          </span>

          {post.category && (
            <span className="metaChip categoryChip">
              {post.category}
            </span>
          )}
        </div>
      </div>

      <div className="postActions">
        <button className="actionBtn">
          <Heart size={18} />

          <span>
            {post.likes > 0 ? post.likes : "إعجاب"}
          </span>
        </button>

        <button className="actionBtn">
          <MessageCircle size={18} />

          <span>
            {post.commentsCount > 0
              ? post.commentsCount
              : "تعليق"}
          </span>
        </button>

        <button className="actionBtn primary">
          <Send size={18} />
          <span>تواصل الآن</span>
        </button>
      </div>
    </article>
  );
};

export default function Home() {

  const { isAuthenticated } = useAuth();

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

  const posts = useMemo(
    () => (isAuthenticated ? demoPosts.map(normalizePost) : []),
    [isAuthenticated],
  );
  const loading = false;

  return (
    <MainLayout>

      <section className="heroWrapper">

        <div className="heroContent">

          <span className="heroMiniBadge">
            منصة المفقودات الأولى
          </span>

          <h1 className="heroTitle">
            فقدت شيئا؟
            <br />
            أو وجدت غرضا؟
          </h1>

          <p className="heroDescription">
            منصة تساعد المجتمع على استعادة المفقودات والتواصل بسهولة وأمان داخل الأردن.
          </p>

        </div>

        <div className="heroVisual">
          <img src="/images/home.png" alt="FoundIt" />
        </div>

      </section>

      {isAuthenticated && (
        <section className="feedSection">

          <div className="feedHeader">
            <div>
              <h2 className="feedHeading">
                أحدث المنشورات
              </h2>

              <p className="feedSub">
                تصفح آخر الأشياء المفقودة والموجودة
              </p>
            </div>
          </div>

          <div className="postList">

            {loading ? (
              <div className="stateBox">
                جاري تحميل المنشورات...
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                />
              ))
            )}

          </div>

        </section>
      )}

    </MainLayout>
  );
}
