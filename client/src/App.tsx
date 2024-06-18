import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const App = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");
  const [connected, setConnected] = useState<number>(0);

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8080");

    newSocket.onopen = () => {
      console.log("connected");
      newSocket.send(JSON.stringify({ type: "join", id: uuidv4() }));
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.connected !== undefined) {
        setConnected(data.connected);
      } else if (data.message) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendHandler = () => {
    if (message.trim() === "") return;
    socket?.send(JSON.stringify({ type: "message", message }));
    setMessage("");
  };

  return (
    <div className='flex flex-col'>
      <div className='flex gap-5'>
        <input
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendHandler}>Send</button>
      </div>
      <div>Connected users: {connected}</div>
      <div className='flex flex-col gap-2'>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
    </div>
  );
};

export default App;
