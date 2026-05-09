import Link from "next/link";
import Badge from "../ui/Badge";

export default function ConversationCard({ conversation }) {
  const otherUser = conversation.participants?.[0];

  return (
    <Link
      href={`/messages/${conversation._id}`}
      className="conversationCard"
    >
      <div>
        <h3>{otherUser?.name || "مستخدم"}</h3>
        <p>{conversation.lastMessageText || "لا توجد رسائل بعد"}</p>
      </div>

      {conversation.relatedPost && (
        <Badge variant="primary">
          {conversation.relatedPost.title}
        </Badge>
      )}
    </Link>
  );
}