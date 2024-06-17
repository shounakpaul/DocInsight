import React, { useState } from "react";
import Button from "./button";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/ask_pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.text();
      setMessages([
        ...messages,
        { text: input, sender: "user" },
        { text: data, sender: "bot" },
      ]);
      setInput("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center px-10 py-10 mx-10 my-5 border gap-y-10 border-neutral-500 rounded-3xl">
      {messages.map((message, index) => (
        <p
          key={index}
          className={message.sender === "user" ? "text-right" : "text-left"}
        >
          {message.text}
        </p>
      ))}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-row items-center space-x-5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-black rounded-3xl"
            placeholder="Ask a question..."
          />
          <Button type="submit" content="Send" />
        </div>
      </form>
    </div>
  );
}

export default Chat;
