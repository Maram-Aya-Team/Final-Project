import { apiRequest } from "./api";

const toQueryString = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      params.append(key, value);
    }
  });

  return params.toString();
};

export const getFeedPosts = (filters = {}) => {
  const query = toQueryString(filters);
  return apiRequest(`/posts/feed${query ? `?${query}` : ""}`);
};

export const getPosts = (filters = {}) => {
  const query = toQueryString(filters);
  return apiRequest(`/posts${query ? `?${query}` : ""}`);
};

export const getPostById = (id) => apiRequest(`/posts/${id}`);

export const createPost = async (postData) => {
  return apiRequest("/posts", {
    method: "POST",
    body: postData,
  });
};
