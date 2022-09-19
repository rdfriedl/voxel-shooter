import { Client } from "colyseus.js";
import { MyState } from "schema";
const client = new Client("ws://localhost:5000");

export async function connect() {
  try {
    const room = await client.joinOrCreate<MyState>("my_room");

    room.onStateChange((newState) => {
      console.log("New state:", newState);
    });

    room.onLeave((code) => {
      console.log("You've been disconnected.");
    });
  } catch (e) {
    console.error("Couldn't connect:", e);
  }
}
