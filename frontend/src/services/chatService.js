import { apiRequest } from "./api";

export const createOrGetConversation = (data) => {
  return apiRequest("/conversations", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getMyConversations = () => {
  return apiRequest("/conversations");
};

export const getMessages = (conversationId) => {
  return apiRequest(`/messages/${conversationId}`);
};

export const sendMessage = (data) => {
  return apiRequest("/messages", {
    method: "POST",
    body: JSON.stringify(data),
  });
};