"use client";

import { useEffect, useState, useCallback } from "react";
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

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const demoPosts = [
    {
      _id: "demo-1",
      type: "lost",
      title: "مفاتيح سيارة مفقودة",
      description: "مفقودة بالقرب من الجامعة، عليها علاقة زرقاء.",
      city: "Amman",
      category: "Keys",
      images: [],
      user: { name: "أحمد" },
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
      category: "Bag",
      images: [],
      user: { name: "سارة" },
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
      category: "Phone",
      images: [],
      user: { name: "ليان" },
      likes: 4,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    },
  ];

  const loadPosts = useCallback(async () => {

    if (!isAuthenticated) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setPosts(demoPosts.map(normalizePost));
      setLoading(false);
    }, 300);

  }, [isAuthenticated]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

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