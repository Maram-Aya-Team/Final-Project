"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getFeedPosts, getPosts } from "../services/postService";

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ar-JO");
};

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getFeedPosts({ limit: 20 })
      .then((feed) => {
        if (!active) return null;
        const feedItems = feed?.data;
        if (Array.isArray(feedItems)) {
          setPosts(feedItems);
          return null;
        }
        return getPosts({ limit: 20 });
      })
      .then((fallback) => {
        if (!active || !fallback) return;
        setPosts(fallback?.posts || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "تعذر تحميل المنشورات");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError("");
    try {
      const feed = await getFeedPosts({ limit: 20 });
      const feedItems = feed?.data;
      if (Array.isArray(feedItems)) {
        setPosts(feedItems);
      } else {
        const fallback = await getPosts({ limit: 20 });
        setPosts(fallback?.posts || []);
      }
    } catch (err) {
      setError(err.message || "تعذر تحميل المنشورات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <section className="heroRow">
        <div>
          <h1>FounIt JO</h1>
          <p>مفقودات وموجودات الأردن في واجهة بسيطة وواضحة.</p>
        </div>
        <div className="heroActions">
          <Link href="/map" className="btn btn-primary">
            فتح الخريطة
          </Link>
          <Link href="/search" className="btn btn-outline">
            بحث متقدم
          </Link>
        </div>
      </section>

      <section className="feedSection">
        <div className="sectionHead">
          <h2>أحدث المنشورات</h2>
          <Button variant="outline" onClick={() => void handleRefresh()}>
            تحديث
          </Button>
        </div>

        {error && <div className="stateError">{error}</div>}

        {loading ? (
          <div className="postGrid">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeletonCard" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="stateEmpty">لا توجد منشورات متاحة حاليًا</div>
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
                  <span>{formatDate(post.itemDate || post.createdAt)}</span>
                </div>

                <Link href={`/posts/${post._id}`} className="postLink">
                  عرض التفاصيل
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
