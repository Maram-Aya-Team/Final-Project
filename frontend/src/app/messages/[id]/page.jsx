"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import ChatHeader from "../../../components/chat/ChatHeader";
import ChatBubble from "../../../components/chat/ChatBubble";
import MessageInput from "../../../components/chat/MessageInput";
import { getMessages, sendMessage } from "../../../services/chatService";
import { useAuth } from "../../../context/AuthContext";

export default function ChatRoomPage({ params }) {
  const { user } = useAuth();
  const { id } = params;

  const [messages, setMessages] = useState([]);
  const [error, setError] = useState("");

  const loadMessages = async () => {
    try {
      const data = await getMessages(id);
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [id]);

  const handleSend = async (content) => {
    try {
      const data = await sendMessage({
        conversationId: id,
        content,
      });

      setMessages((prev) => [...prev, data.data]);
    } catch (err) {
      setError(err.message);
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
              isMine={message.sender?._id === user?.id}
            />
          ))
        )}
      </div>

      <MessageInput onSend={handleSend} />
    </MainLayout>
  );
}