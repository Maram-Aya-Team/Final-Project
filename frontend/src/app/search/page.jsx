"use client";

import { useEffect, useState } from "react";

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

  const [filters, setFilters] = useState({
    keyword: "",
    city: "",
    type: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    try {
      setLoading(true);

      const data = await getPosts(filters);

      setPosts(data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleSearch = () => {
    loadPosts();
  };

  return (
    <MainLayout>
      <div className="searchPage">
        <div className="searchHeader">
          <h1>البحث عن المفقودات والموجودات</h1>
          <p>ابحث باستخدام الكلمات المفتاحية أو المدينة أو النوع</p>
        </div>

        <Card>
          <div className="searchFilters">
            <Input
              placeholder="ابحث عن هاتف، محفظة..."
              value={filters.keyword}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  keyword: e.target.value,
                })
              }
            />

            <Select
              value={filters.city}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  city: e.target.value,
                })
              }
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
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: e.target.value,
                })
              }
              options={[
                { label: "كل الأنواع", value: "" },
                { label: "مفقود", value: "lost" },
                { label: "موجود", value: "found" },
              ]}
            />

            <Button onClick={handleSearch}>
              بحث
            </Button>
          </div>
        </Card>

        <div className="searchResults">
          {loading ? (
            <p>جاري التحميل...</p>
          ) : posts.length === 0 ? (
            <p>لا توجد نتائج</p>
          ) : (
            posts.map((post) => (
              <Card key={post._id}>
                <div className="postCard">
                  <div className="postTop">
                    <h3>{post.title}</h3>

                    <Badge
                      variant={
                        post.type === "lost"
                          ? "danger"
                          : "success"
                      }
                    >
                      {post.type === "lost"
                        ? "مفقود"
                        : "موجود"}
                    </Badge>
                  </div>

                  <p>{post.description}</p>

                  <div className="postInfo">
                    <span>{post.city}</span>
                    <span>{post.area}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}