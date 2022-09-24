import { Client, Room } from "colyseus.js";
import { State } from "../common/schema";
const client = new Client("ws://localhost:5000");
let room: Room<State> | null = null;

export function getRoom() {
  return room;
}

export async function connect() {
  try {
    room = await client.joinOrCreate("my_room", {}, State);
    if (!room) return;

    room.onStateChange((newState) => {
      if (!room) return;
      console.log("New state:", newState);
      console.log(newState.timeLeft);
      console.log(newState.players.get(room.sessionId));
    });

    room.state.players.onAdd = (player, key) => {
      console.log(player, key);
    };

    room.onLeave((code) => {
      console.log("You've been disconnected.");
      room = null;
    });

    room.onMessage("hello", (message) => console.log(message));
  } catch (e) {
    console.error("Couldn't connect:", e);
  }
}
