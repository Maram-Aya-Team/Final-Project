export default function ChatBubble({ message, isMine }) {
  return (
    <div className={`chatBubbleRow ${isMine ? "mine" : "theirs"}`}>
      <div className={`chatBubble ${isMine ? "mineBubble" : "theirBubble"}`}>
        <p>{message.content}</p>
      </div>
    </div>
  );
}