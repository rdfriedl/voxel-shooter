import { Client, Room } from "colyseus.js";
import { Vector3 } from "three";
import { State, UserLnInfo } from "../common/schema";
import { Signal } from "../common/utils/emitter";

export const client = new Client(
  import.meta.env.DEV ? "ws://localhost:2567" : location.protocol.replace("http", "ws") + "//" + location.host
);

export const onFirstState = new Signal<[State]>();
export const onJoin = new Signal<[Room<State>]>();
export const onLeave = new Signal<[number]>();

export const onBulletCreate = new Signal<[number, Vector3, Vector3]>();
export const onBulletChange = new Signal<[number, Vector3, Vector3]>();
export const onBulletDestroy = new Signal<[number]>();

let room: Room<State> | null = null;
export async function connect(userLnInfo: UserLnInfo) {
  try {
    room = await client.joinOrCreate("game-room", { userLnInfo }, State);

    let firstState = false;
    room.onStateChange(() => {
      if (!firstState && room) {
        onFirstState.emit(room.state);
        firstState = true;
      }
    });

    room.onLeave((code) => {
      room = null;
      onLeave.emit(code);
    });

    room.onMessage("hello", (message) => console.log(message));

    room.onMessage("bullet-create", (message) => {
      const id = message.id;
      const position = new Vector3().fromArray(message.position);
      const velocity = new Vector3().fromArray(message.velocity);
      onBulletCreate.emit(id, position, velocity);
    });

    onJoin.emit(room);
    return room;
  } catch (e) {
    console.error("Couldn't connect:", e);
  }
}

export function getRoom() {
  return room;
}
