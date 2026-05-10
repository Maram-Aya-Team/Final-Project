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

export const getNotifications = (filters = {}) => {
  const query = toQuery(filters);
  return apiRequest(`/notifications${query ? `?${query}` : ""}`);
};

export const markNotificationAsRead = (id) =>
  apiRequest(`/notifications/${id}/read`, {
    method: "PATCH",
  });

export const markAllNotificationsAsRead = () =>
  apiRequest("/notifications/read-all", {
    method: "PATCH",
  });

export const clearReadNotifications = () =>
  apiRequest("/notifications/clear-read", {
    method: "DELETE",
  });
