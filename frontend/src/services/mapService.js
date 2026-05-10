import { apiRequest } from "./api";

const toQuery = (paramsObj = {}) => {
  const params = new URLSearchParams();

  Object.entries(paramsObj).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      params.append(key, value);
    }
  });

  return params.toString();
};

export const getMapItems = async (filters = {}) => {
  const query = toQuery(filters);
  const response = await apiRequest(`/maps/items${query ? `?${query}` : ""}`);

  const payload = response?.data || {};
  const posts = Array.isArray(payload.posts)
    ? payload.posts
    : [...(payload.lost || []), ...(payload.found || [])];

  return {
    items: posts,
    mode: payload.mode || "city",
    total: payload.total || posts.length,
  };
};

export const getMapCities = async () => {
  const response = await apiRequest("/maps/cities");
  return response?.data || [];
};
