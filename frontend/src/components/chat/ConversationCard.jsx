"use client";

import Link from "next/link";
import Badge from "../ui/Badge";

const getCurrentUserId = () => {
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

export default function ConversationCard({ conversation }) {
  const me = getCurrentUserId();
  const otherUser = conversation.participants?.find((user) => user?._id !== me);

  return (
    <Link href={`/messages/${conversation._id}`} className="conversationCard">
      <div>
        <h3>{otherUser?.name || "مستخدم"}</h3>
        <p>{conversation.lastMessageText || "لا توجد رسائل بعد"}</p>
      </div>

      {conversation.relatedPost?.title && <Badge variant="primary">{conversation.relatedPost.title}</Badge>}
    </Link>
  );
}
