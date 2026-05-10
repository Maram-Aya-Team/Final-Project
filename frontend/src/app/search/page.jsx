"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MainLayout from "../../components/layout/MainLayout";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import { getPosts } from "../../services/postService";
import { JORDAN_CITIES } from "../../constants/cities";

export default function SearchPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    keyword: "",
    city: "",
    type: "",
    status: "",
  });

  const loadPosts = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getPosts(filters);
      setPosts(data?.posts || []);
    } catch (err) {
      setError(err.message || "تعذر تحميل النتائج");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    getPosts({
      keyword: "",
      city: "",
      type: "",
      status: "",
    })
      .then((data) => {
        if (!active) return;
        setPosts(data?.posts || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || "تعذر تحميل النتائج");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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
              ...JORDAN_CITIES.map((city) => ({ label: city, value: city })),
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

          <Button onClick={() => void loadPosts()}>تطبيق</Button>
        </div>
      </Card>

      {error && <div className="stateError">{error}</div>}

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
