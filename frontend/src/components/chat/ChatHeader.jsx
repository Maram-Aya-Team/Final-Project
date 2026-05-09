export default function ChatHeader({ title }) {
  return (
    <div className="chatHeader">
      <h2>{title || "المحادثة"}</h2>
      <p>تواصل بأمان مع الطرف الآخر</p>
    </div>
  );
}