"use client";

import { useState } from "react";
import Button from "../ui/Button";

export default function MessageInput({ onSend }) {
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleaned = content.trim();
    if (!cleaned) return;

    onSend(cleaned);
    setContent("");
  };

  return (
    <form className="messageInput" onSubmit={handleSubmit}>
      <input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="اكتب رسالتك"
      />

      <Button type="submit" disabled={!content.trim()}>
        إرسال
      </Button>
    </form>
  );
}
