export default function ChatBubble({ message, isMine }) {
  const senderName = message.sender?.name || "مستخدم";

  return (
    <div className={`chatBubbleRow ${isMine ? "mine" : "theirs"}`}>
      <div className={`chatBubble ${isMine ? "mineBubble" : "theirBubble"}`}>
        {!isMine && <span className="senderName">{senderName}</span>}
        <p>{message.content}</p>
      </div>
    </div>
  );
}