export const normalizePost = (post) => {
  return {
    _id: post._id || post.id,
    type: post.type || "lost",
    title: post.title || "بدون عنوان",
    description: post.description || "",
    city: post.city || "",
    area: post.area || "",
    category:
      typeof post.category === "object"
        ? post.category?.name
        : post.category || "",
    images: Array.isArray(post.images) ? post.images : [],
    user: post.user || {
      name: post.userName || "مستخدم FoundIt",
      avatar: post.avatar || null,
    },
    likes: post.likesCount ?? post.likes ?? 0,
    commentsCount: post.commentsCount ?? 0,
    createdAt: post.createdAt || new Date().toISOString(),
    status: post.status || "approved",
    isResolved: post.isResolved || false,
  };
};