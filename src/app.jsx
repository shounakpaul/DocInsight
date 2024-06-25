import React, { useState } from "react";
import Navbar from "./components/navbar";
import Upload from "./components/upload";
import Chat from "./components/chat";

function App() {
  const [messages, setMessages] = useState([]);
  return (
    <>
      <Navbar />
      <Upload setMessages={setMessages} />
      <Chat messages={messages} setMessages={setMessages} />
    </>
  );
}

export default App;
