"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MainLayout from "../../../components/layout/MainLayout";
import Card from "../../../components/ui/Card";
import Badge from "../../../components/ui/Badge";
import { getPostById } from "../../../services/postService";

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("ar-JO");
};

export default function PostDetailsPage() {
  const params = useParams();
  const id = params.id;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPost = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError("");

    try {
      const data = await getPostById(id);
      setPost(data?.post || null);
    } catch (err) {
      setError(err.message || "تعذر تحميل تفاصيل المنشور");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadPost();
  }, [loadPost]);

  return (
    <MainLayout>
      {loading ? (
        <div className="skeletonCard" />
      ) : error ? (
        <div className="stateError">{error}</div>
      ) : !post ? (
        <div className="stateEmpty">المنشور غير متاح</div>
      ) : (
        <Card className="postDetailsCard">
          <div className="postTop">
            <h1>{post.title}</h1>
            <Badge variant={post.type === "lost" ? "danger" : "success"}>
              {post.type === "lost" ? "مفقود" : "موجود"}
            </Badge>
          </div>

          <p className="postDescription">{post.description}</p>

          <div className="detailsGrid">
            <div>
              <span>المدينة</span>
              <strong>{post.city}</strong>
            </div>
            <div>
              <span>المنطقة</span>
              <strong>{post.area}</strong>
            </div>
            <div>
              <span>التاريخ</span>
              <strong>{formatDate(post.itemDate || post.createdAt)}</strong>
            </div>
            <div>
              <span>الحالة</span>
              <strong>{post.status}</strong>
            </div>
          </div>

          {post.location?.address && (
            <div className="addressBlock">
              <span>العنوان</span>
              <strong>{post.location.address}</strong>
            </div>
          )}

          <div className="authorBlock">
            <span>صاحب المنشور</span>
            <strong>{post.user?.name || "غير معروف"}</strong>
          </div>
        </Card>
      )}
    </MainLayout>
  );
}
