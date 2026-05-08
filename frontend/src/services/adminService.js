import { apiRequest } from "./api";

export const getDashboardStats = () => {
  return apiRequest("/admin/dashboard");
};

export const getReports = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });

  return apiRequest(`/admin/reports?${params.toString()}`);
};

export const updateReportStatus = (id, data) => {
  return apiRequest(`/admin/reports/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const getFraudOverview = () => {
  return apiRequest("/admin/fraud");
};