"use client";

import { useEffect, useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import ConversationCard from "../../components/chat/ConversationCard";
import { getMyConversations } from "../../services/chatService";

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await getMyConversations();
        setConversations(data.conversations || []);
      } catch (err) {
        setError(err.message);
      }
    };

    loadConversations();
  }, []);

  return (
    <MainLayout>
      <div className="messagesPage">
        <h1>الرسائل</h1>
        <p>جميع محادثاتك في مكان واحد</p>

        {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

        <div className="conversationsList">
          {conversations.length === 0 ? (
            <p>لا توجد محادثات بعد</p>
          ) : (
            conversations.map((conversation) => (
              <ConversationCard
                key={conversation._id}
                conversation={conversation}
              />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}