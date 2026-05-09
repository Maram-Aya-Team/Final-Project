"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import MainLayout from "../../../components/layout/MainLayout";
import ChatHeader from "../../../components/chat/ChatHeader";
import ChatBubble from "../../../components/chat/ChatBubble";
import MessageInput from "../../../components/chat/MessageInput";

import { getMessages } from "../../../services/chatService";
import {
  connectSocket,
  getSocket,
  disconnectSocket,
} from "../../../services/socketService";

const getUserIdFromToken = () => {
  const token = localStorage.getItem("accessToken");

  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.id || payload._id;
  } catch {
    return null;
  }
};

export default function ChatRoomPage() {
  const params = useParams();
  const id = params.id;

  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    setCurrentUserId(getUserIdFromToken());
  }, []);

  const loadMessages = async () => {
    try {
      if (!id) return;

      const data = await getMessages(id);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message || "تعذر تحميل الرسائل");
    }
  };

  useEffect(() => {
    loadMessages();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const socket = connectSocket();

    socket.emit("joinConversation", id);

    socket.on("newMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("newMessage");
      disconnectSocket();
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = (content) => {
    try {
      const socket = getSocket();

      if (!socket) {
        setError("الاتصال غير جاهز");
        return;
      }

      socket.emit("sendMessage", {
        conversationId: id,
        content,
      });
    } catch (err) {
      setError(err.message || "تعذر إرسال الرسالة");
    }
  };

  return (
    <MainLayout>
      <ChatHeader title="المحادثة" />

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <div className="chatMessages">
        {messages.length === 0 ? (
          <p>لا توجد رسائل بعد</p>
        ) : (
          messages.map((message) => (
            <ChatBubble
              key={message._id}
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