import { Client, Room } from "colyseus.js";
import { EventDispatcher, Vector3 } from "three";
import { State } from "../common/schema";

export const client = new Client(
  import.meta.env.DEV ? "ws://localhost:2567" : location.protocol.replace("http", "ws") + "//" + location.host
);

let room: Room<State> | null = null;

export async function connect() {
  try {
    room = await client.joinOrCreate("game-room", {}, State);

    room.onLeave((code) => {
      console.log("You've been disconnected.");
      room = null;
    });

    room.onMessage("hello", (message) => console.log(message));

    return room;
  } catch (e) {
    console.error("Couldn't connect:", e);
  }
}

export function getRoom() {
  return room;
}
