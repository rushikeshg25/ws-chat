import express from "express";
import { WebSocketServer } from "ws";

type message = {
  type: string;
  message?: string;
  id?: string;
};

const app = express();
const httpServer = app.listen(8080);
let connected = 0;
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws) => {
  connected++;
  updateConnectedClients();

  ws.on("error", console.error);

  ws.on("message", (data) => {
    const message = JSON.parse(data.toString()) as message;

    if (message.type === "join") {
      ws.send(JSON.stringify({ connected: connected }));
    }

    if (message.type === "message") {
      broadcastMessage(message.message!);
    }
  });

  ws.on("close", () => {
    connected--;
    updateConnectedClients();
  });

  ws.send(JSON.stringify({ message: "Hello! Message From Server!!" }));
});

const updateConnectedClients = () => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ connected: connected }));
    }
  });
};

const broadcastMessage = (message: string) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ message: message }));
    }
  });
};
