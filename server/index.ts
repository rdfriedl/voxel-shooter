import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { monitor } from "@colyseus/monitor";
import { createServer } from "http";
import express from "express";
import { MyRoom } from "./rooms/MyRoom";

const port = Number(process.env.port) || 5000;

const app = express();
app.use(express.json());
// attach web monitoring panel
app.use("/colyseus", monitor());

const gameServer = new Server({
  transport: new WebSocketTransport({
    server: createServer(app),
  }),
});

gameServer.define("my_room", MyRoom);

gameServer.listen(port);
console.log(`Listening on ws://localhost:5000`);
