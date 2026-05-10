"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import MainLayout from "../../components/layout/MainLayout";
import { getPosts } from "../../services/postService";
import {
  Search, MapPin, Calendar, Heart,
  MessageCircle, Send, Eye, UserCircle,
  SlidersHorizontal, Sparkles,
  RefreshCw
} from "lucide-react";

/* ─── بطاقة المنشور الواحد ─── */
const PostCard = ({ post, index }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const isLost = post.type === "lost";

  return (
    <article className="feedCard" style={{ animationDelay: `${index * 0.06}s` }}>

      {/* ── هيدر البطاقة ── */}
      <div className="feedCardHeader">
        <div className="feedCardUser">
          {post.avatar ? (
            <img src={post.avatar} alt="avatar" className="feedAvatar" />
          ) : (
            <div className="feedAvatarPlaceholder">
              <UserCircle size={28} />
            </div>
          )}
          <div>
            <span className="feedUserName">{post.userName || "مستخدم FoundIt"}</span>
            <span className="feedUserMeta">
              <Calendar size={12} />
              {new Date(post.createdAt).toLocaleDateString("ar-JO", {
                day: "numeric", month: "short"
              })}
            </span>
          </div>
        </div>

        <span className={`feedTypeBadge ${isLost ? "feedBadgeLost" : "feedBadgeFound"}`}>
          {isLost ? "🔴 مفقود" : "🟢 موجود"}
        </span>
      </div>

      {/* ── صورة المنشور ── */}
      <div className="feedCardImage">
        {post.images?.[0] ? (
          <img src={post.images[0]} alt={post.title} />
        ) : (
          <div className="feedCardImagePlaceholder">
            <Eye size={40} />
            <span>لا توجد صورة</span>
          </div>
        )}

        {/* شارة الأولوية */}
        {post.isPriority && (
          <div className="feedPriorityBadge">
            <Sparkles size={12} /> أولوية
          </div>
        )}
      </div>

      {/* ── محتوى النص ── */}
      <div className="feedCardBody">
        <h3 className="feedCardTitle">{post.title}</h3>
        <p className="feedCardDesc">{post.description}</p>

        <div className="feedCardMeta">
          <span className="feedMetaChip">
            <MapPin size={13} /> {post.city}
          </span>
          {post.category && (
            <span className="feedMetaChip feedMetaCategory">{post.category}</span>
          )}
        </div>
      </div>

      {/* ── أزرار التفاعل ── */}
      <div className="feedCardActions">
        <button
          className={`feedActionBtn ${liked ? "feedActionLiked" : ""}`}
          onClick={handleLike}
          aria-label="إعجاب"
        >
          <Heart size={17} fill={liked ? "currentColor" : "none"} />
          <span>{likeCount > 0 ? likeCount : "إعجاب"}</span>
        </button>

        <button className="feedActionBtn" aria-label="تعليق">
          <MessageCircle size={17} />
          <span>{post.commentsCount > 0 ? post.commentsCount : "تعليق"}</span>
        </button>

        <button className="feedActionBtn feedActionContact" aria-label="تواصل">
          <Send size={16} />
          <span>تواصل الآن</span>
        </button>
      </div>
    </article>
  );
};

/* ─── بطاقة هيكلية (Skeleton) أثناء التحميل ─── */
const SkeletonCard = () => (
  <div className="feedCard feedCardSkeleton">
    <div className="skHeader">
      <div className="skCircle" />
      <div className="skLines">
        <div className="skLine skLineW60" />
        <div className="skLine skLineW40" />
      </div>
    </div>
    <div className="skImage" />
    <div className="skBody">
      <div className="skLine skLineW80" />
      <div className="skLine skLineW100" />
      <div className="skLine skLineW60" />
    </div>
  </div>
);

/* ─── الصفحة الرئيسية ─── */
export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState("all"); // all | lost | found
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const loaderRef = useRef(null);

  /* ── جلب البيانات ── */
  const fetchPosts = useCallback(async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const data = await getPosts({
        page: pageNum,
        limit: 8,
        ...(filter !== "all" ? { type: filter } : {}),
        ...(search ? { keyword: search } : {}),
      });

      const newPosts = data?.posts || [];
      setPosts((prev) => (reset || pageNum === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMore(pageNum < (data?.totalPages || 1));
    } catch {
      /* خطأ في الاتصال — البيانات التجريبية للعرض */
      const demo = [
        {
          _id: "1", title: "حقيبة ظهر سوداء سامسونايت",
          description: "وجدت بالقرب من مول العبدلي، تحتوي على كتب دراسية ومحفظة.",
          type: "found", city: "عمان", category: "حقائب", createdAt: new Date(),
          likes: 14, commentsCount: 5,
          images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"]
        },
        {
          _id: "2", title: "مفاتيح سيارة تويوتا",
          description: "مفقودة بالقرب من سيتي مول، عليها حلقة مفاتيح زرقاء مميزة.",
          type: "lost", city: "عمان", category: "مفاتيح", createdAt: new Date(),
          likes: 3, commentsCount: 2, isPriority: true,
          images: ["https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80"]
        },
        {
          _id: "3", title: "جرو لابرادور ذهبي",
          description: "عُثر عليه في حي الصويفية وهو بصحة جيدة ويبدو منزلياً.",
          type: "found", city: "عمان", category: "حيوانات", createdAt: new Date(),
          likes: 58, commentsCount: 31,
          images: ["https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=600&q=80"]
        },
        {
          _id: "4", title: "هاتف آيفون 13 أزرق",
          description: "وجدناه على كرسي في مطعم في دابوق، مع حافظة سوداء.",
          type: "found", city: "عمان", category: "إلكترونيات", createdAt: new Date(),
          likes: 22, commentsCount: 8,
          images: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=600&q=80"]
        },
        {
          _id: "5", title: "بطاقة هوية شخصية",
          description: "وجدت بالقرب من بنك الأردن في وسط البلد باسم أحمد الزيدانيين.",
          type: "found", city: "عمان", category: "وثائق", createdAt: new Date(),
          likes: 7, commentsCount: 1,
          images: []
        },
        {
          _id: "6", title: "نظارة طبية إطار بني",
          description: "نسيتها في مكتبة الجامعة الأردنية على طاولة الدراسة الثالثة.",
          type: "lost", city: "عمان", category: "إكسسوارات", createdAt: new Date(),
          likes: 1, commentsCount: 0,
          images: ["https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80"]
        },
      ];
      if (pageNum === 1 || reset) setPosts(demo);
      else setPosts((prev) => [...prev, ...demo.slice(0, 2)]);
      setHasMore(pageNum < 3);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchPosts(1, true);
  }, [filter, search, fetchPosts]);

  /* ── Infinite Scroll Observer ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const next = page + 1;
          setPage(next);
          fetchPosts(next);
        }
      },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <MainLayout>

      {/* ══════════════ Hero Section ══════════════ */}
      <section className="homehero">
        <div className="homeheroInner">
          <div className="homeheroText">
            <h1 className="homeheroTitle">
              فقدت أو وجدت شيئاً؟
              <br />
              <span>نحن نربط المجتمع.</span>
            </h1>
            <p className="homeheroSub">
              منصة الأردن الأولى لاسترداد المفقودات والتواصل المجتمعي الآمن.
            </p>

            {/* شريط البحث */}
            <form className="homeheroSearch" onSubmit={handleSearch}>
              <select
                className="homeheroSelect"
                value={filter}
                onChange={(e) => {
                  setPage(1);
                  setFilter(e.target.value);
                }}
              >
                <option value="all">نوع الغرض</option>
                <option value="lost">مفقود</option>
                <option value="found">موجود</option>
              </select>

              <div className="homeheroSearchDivider" />

              <div className="homeheroSearchLocation">
                <MapPin size={15} />
                <input
                  type="text"
                  placeholder="الموقع"
                  className="homeheroLocationInput"
                />
              </div>

              <div className="homeheroSearchDivider" />

              <input
                type="text"
                placeholder="ابحث عن شيء..."
                className="homeheroTextInput"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />

              <button type="submit" className="homeheroSearchBtn">
                <Search size={17} />
                بحث
              </button>
            </form>
          </div>

          {/* صورة الهيرو */}
          <div className="homeheroVisual">
            <img
              src="/images/hero-illustration.png"
              alt="FoundIt Jo"
              className="homeheroImg"
            />
          </div>
        </div>

        {/* فلتر مفقود / موجود */}
        <div className="homeheroToggleRow">
          <span className="homeheroToggleLabel">مفقود / موجود</span>
          <div className="homeheroToggle">
            {["all", "lost", "found"].map((t) => (
              <button
                key={t}
                className={`homeheroToggleBtn ${filter === t ? "homeheroToggleActive" : ""}`}
                onClick={() => {
                  setPage(1);
                  setFilter(t);
                }}
              >
                {t === "all" ? "الكل" : t === "lost" ? "مفقود" : "موجود"}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ Feed Section ══════════════ */}
      <section className="homeFeedSection">

        <div className="homeFeedHeader">
          <h2 className="homeFeedTitle">
            {filter === "all" ? "أحدث المنشورات" :
             filter === "lost" ? "المفقودات" : "الموجودات"}
          </h2>
          <button className="homeFeedFilterBtn" aria-label="فلترة">
            <SlidersHorizontal size={16} />
            فلترة
          </button>
        </div>

        {/* قائمة البطاقات */}
        <div className="homeFeedList">
          {loading
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            : posts.length === 0
            ? (
              <div className="homeFeedEmpty">
                <Eye size={48} />
                <p>لا توجد منشورات حالياً</p>
                <button
                  className="homeFeedEmptyBtn"
                  onClick={() => fetchPosts(1, true)}
                >
                  <RefreshCw size={16} /> إعادة المحاولة
                </button>
              </div>
            )
            : posts.map((post, i) => (
              <PostCard key={post._id} post={post} index={i} />
            ))
          }
        </div>

        {/* Infinite Scroll Trigger */}
        <div ref={loaderRef} className="homeFeedLoader">
          {loadingMore && (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}
          {!hasMore && !loading && posts.length > 0 && (
            <p className="homeFeedEnd">🎉 وصلت لآخر المنشورات</p>
          )}
        </div>

      </section>
    </MainLayout>
  );
}
