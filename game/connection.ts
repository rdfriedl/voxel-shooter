import { Client, Room } from "colyseus.js";
import { Vector3 } from "three";
import { State } from "../common/schema";

const client = new Client(
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
  } catch (e) {
    console.error("Couldn't connect:", e);
  }
}

export function sendPlayerPosition(position: Vector3, velocity: Vector3) {
  if (!room) return;
  room.send("position", { position, velocity });
}

export function shoot(bullets: [Vector3, Vector3][]) {
  if (!room) return;
  room.send("position", bullets);
}

export function getRoom() {
  return room;
}
export function getCurrentState() {
  return room?.state;
}
