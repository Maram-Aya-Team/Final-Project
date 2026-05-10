"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import MainLayout from "../components/layout/MainLayout";

import {
  Search,
  MapPin,
  Calendar,
  Heart,
  MessageCircle,
  Send,
  Eye,
  UserCircle,
} from "lucide-react";

import {
  getFeedPosts,
  getPosts,
} from "../services/postService";

/* ═════════════════════════════
   بطاقة المنشور
═════════════════════════════ */

const PostCard = ({ post }) => {

  const isLost = post.type === "lost";

  return (
    <article className="singlePostCard">

      {/* الهيدر */}

      <div className="postHeader">

        <div className="postUser">

          <div className="postAvatar">

            {post.user?.avatar ? (
              <img
                src={post.user.avatar}
                alt="avatar"
              />
            ) : (
              <UserCircle
                size={34}
                color="#94a3b8"
              />
            )}

          </div>

          <div>

            <h4 className="postUserName">
              {post.user?.name || "مستخدم FoundIt"}
            </h4>

            <div className="postDate">

              <Calendar size={13} />

              <span>
                {new Date(
                  post.createdAt
                ).toLocaleDateString("ar-JO", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>

            </div>

          </div>

        </div>

        <span
          className={`typeBadge ${
            isLost
              ? "bg-danger"
              : "bg-success"
          }`}
        >
          {isLost
            ? "🔴 مفقود"
            : "🟢 موجود"}
        </span>

      </div>

      {/* الصورة */}

      <div className="postImageContainer">

        {post.images?.[0] ? (

          <img
            src={post.images[0]}
            alt={post.title}
          />

        ) : (

          <div className="postNoImage">

            <Eye
              size={48}
              color="#cbd5e1"
            />

            <span>
              لا توجد صورة
            </span>

          </div>

        )}

      </div>

      {/* المحتوى */}

      <div className="postContent">

        <h3 className="postTitle">
          {post.title}
        </h3>

        <p className="postDescription">
          {post.description}
        </p>

        {/* معلومات إضافية */}

        <div className="postMeta">

          <span className="metaChip">

            <MapPin size={14} />

            {post.city || "عمان"}

          </span>

          {post.category && (

            <span className="metaChip categoryChip">

              {typeof post.category === "object"
                ? post.category.name
                : post.category}

            </span>

          )}

        </div>

      </div>

      {/* الأزرار */}

      <div className="postActions">

        <button className="actionBtn">

          <Heart size={18} />

          <span>
            {post.likes > 0
              ? post.likes
              : "إعجاب"}
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

          <span>
            تواصل الآن
          </span>

        </button>

      </div>

    </article>
  );
};

/* ═════════════════════════════
   الصفحة الرئيسية
═════════════════════════════ */

export default function Home() {

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [type, setType] =
    useState("all");

  /* تحميل المنشورات */

  const loadPosts = useCallback(async () => {
    try {

      const feed =
        await getFeedPosts({
          limit: 20,
        });

      if (
        feed?.data &&
        Array.isArray(feed.data)
      ) {

        setPosts(feed.data);

      } else {

        const fallback =
          await getPosts({
            limit: 20,
          });

        setPosts(
          fallback?.posts || []
        );
      }

    } catch {

      setError(
        "تعذر تحميل المنشورات"
      );

    } finally {

      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  /* فلترة المنشورات */

  const filteredPosts = useMemo(() => {

    return posts.filter((post) => {

      const matchesType =
        type === "all"
          ? true
          : post.type === type;

      const matchesSearch =
        search.trim() === ""
          ? true
          : post.title
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            post.description
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

      return (
        matchesType &&
        matchesSearch
      );
    });

  }, [posts, type, search]);

  return (
    <MainLayout>

      {/* ═════════ HERO ═════════ */}

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

            منصة تساعد المجتمع على
            استعادة المفقودات والتواصل
            بسهولة وأمان داخل الأردن.

          </p>

          {/* البحث */}

          <div className="searchContainer">

            <select
              value={type}
              onChange={(e) =>
                setType(
                  e.target.value
                )
              }
            >

              <option value="all">
                كل المنشورات
              </option>

              <option value="lost">
                المفقودات
              </option>

              <option value="found">
                الموجودات
              </option>

            </select>

            <input
              type="text"
              placeholder="ابحث عن غرض أو وصف..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

            <button className="searchBtn">

              <Search size={20} />

            </button>

          </div>

        </div>

        {/* صورة الهيرو */}

        <div className="heroVisual">

          <img
            src="/images/home.png"
            alt="FoundIt"
          />

        </div>

      </section>

      {/* ═════════ عنوان القسم ═════════ */}

      <section className="feedSection">

        <div className="feedHeader">

          <div>

            <h2 className="feedHeading">
              أحدث المنشورات
            </h2>

            <p className="feedSub">
              تصفح آخر الأشياء
              المفقودة والموجودة
            </p>

          </div>

        </div>

        {/* المنشورات */}

        <div className="postList">

          {loading ? (

            <div className="stateBox">
              جاري تحميل المنشورات...
            </div>

          ) : error ? (

            <div className="stateBox">
              {error}
            </div>

          ) : filteredPosts.length === 0 ? (

            <div className="stateBox">
              لا توجد نتائج مطابقة
            </div>

          ) : (

            filteredPosts.map((post) => (

              <PostCard
                key={post._id}
                post={post}
              />

            ))

          )}

        </div>

      </section>

    </MainLayout>
  );
}
