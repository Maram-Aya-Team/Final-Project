"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import MainLayout from "../../../components/layout/MainLayout";
import ChatHeader from "../../../components/chat/ChatHeader";
import ChatBubble from "../../../components/chat/ChatBubble";
import MessageInput from "../../../components/chat/MessageInput";
import { getMessages } from "../../../services/chatService";
import { connectSocket, getSocket, disconnectSocket } from "../../../services/socketService";

const getUserIdFromToken = () => {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.id || payload._id || null;
  } catch {
    return null;
  }
};

export default function ChatRoomPage() {
  const params = useParams();
  const conversationId = params.id;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId] = useState(getUserIdFromToken);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    let active = true;

    const loadMessages = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getMessages(conversationId);
        if (!active) return;
        setMessages(data?.messages || []);
      } catch (err) {
        if (!active) return;
        setError(err.message || "تعذر تحميل الرسائل");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadMessages();

    return () => {
      active = false;
    };
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const socket = connectSocket();
    socket.emit("joinConversation", conversationId);

    socket.on("newMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("newMessage");
      disconnectSocket();
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (content) => {
    const socket = getSocket();

    if (!socket) {
      setError("الاتصال غير جاهز");
      return;
    }

    socket.emit("sendMessage", {
      conversationId,
      content,
    });
  };

  return (
    <MainLayout>
      <ChatHeader title="المحادثة" />

      {error && <div className="stateError">{error}</div>}

      <div className="chatMessages">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => <div key={index} className="skeletonLine" />)
        ) : messages.length === 0 ? (
          <div className="stateEmpty">لا توجد رسائل بعد</div>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message._id || `${message.sender?._id}-${message.createdAt}`}
              message={message}
              isMine={message.sender?._id === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput onSend={handleSend} />
    </MainLayout>
  );
}
