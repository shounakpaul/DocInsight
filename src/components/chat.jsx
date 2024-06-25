import React, { useState } from "react";
import Button from "./button";

function Chat({ messages, setMessages }) {
  // const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/ask_pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input }),
      });
      const data = await response.json();
      console.log(data["answer"]);
      setMessages([
        ...messages,
        { text: input, sender: "user" },
        { text: data["answer"], sender: "bot" },
      ]);
      setInput("");
    } catch (error) {
      console.error(error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col px-10 max-h-[60dvh] overflow-y-scroll py-10 mx-10 my-5 border gap-y-10 border-neutral-500 rounded-3xl">
      {messages.map((message, index) => (
        <p
          key={index}
          className={
            message.sender === "user"
              ? "rounded-tl-3xl rounded-tr-3xl p-2 border border-neutral-400 rounded-bl-3xl text-right"
              : "rounded-tl-3xl rounded-tr-3xl p-2 border border-neutral-400 rounded-br-3xl text-left"
          }
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
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            content={isSubmitting ? "Submitting..." : "Ask"}
            disabled={isSubmitting}
          />
          <Button
            type="button"
            content="Clear Chat"
            onClick={(e) => {
              e.stopPropagation();
              setMessages([]);
            }}
            disabled={isSubmitting}
          />
        </div>
      </form>
    </div>
  );
}

export default Chat;
