"use client";

import { useState } from "react";
import Button from "../ui/Button";

export default function MessageInput({ onSend }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    onSend(content);
    setContent("");
  };

  return (
    <form className="messageInput" onSubmit={handleSubmit}>
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="اكتب رسالتك..."
      />

      <Button type="submit">إرسال</Button>
    </form>
  );
}