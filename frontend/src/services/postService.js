import { apiRequest } from "./api";

export const getPosts = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      params.append(key, value);
    }
  });

  return apiRequest(`/posts?${params.toString()}`);
};

export const getPostById = (id) => {
  return apiRequest(`/posts/${id}`);
};

export const createPost = (postData) => {
  return apiRequest("/posts", {
    method: "POST",
    body: JSON.stringify(postData),
  });
};