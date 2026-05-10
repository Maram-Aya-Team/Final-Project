const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("ar-JO", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ChatBubble({ message, isMine }) {
  const senderName = message.sender?.name || "مستخدم";

  return (
    <div className={`chatBubbleRow ${isMine ? "mine" : "theirs"}`}>
      <div className={`chatBubble ${isMine ? "mineBubble" : "theirBubble"}`}>
        {!isMine && <span className="senderName">{senderName}</span>}
        <p>{message.content}</p>
        <small className="messageTime">{formatTime(message.createdAt)}</small>
      </div>
    </div>
  );
}
