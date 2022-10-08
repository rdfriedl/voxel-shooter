import { Client, Room } from "colyseus.js";
import { Vector3 } from "three";
import { PlayerState, State, UserLnInfo } from "../common/schema";
import { Signal } from "../common/utils/emitter";

export const client = new Client(
  import.meta.env.DEV ? "ws://localhost:2567" : location.protocol.replace("http", "ws") + "//" + location.host
);

export const onFirstState = new Signal<[State]>();
export const onJoin = new Signal<[Room<State>]>();
export const onLeave = new Signal<[number]>();
export const onTimeChange = new Signal<[number]>();

export const onPlayerJoin = new Signal<[PlayerState]>();
export const onPlayerLeave = new Signal<[PlayerState]>();
export const onPlayerPositionChange = new Signal<[PlayerState]>();

export const onBulletCreate = new Signal<[number, Vector3, Vector3]>();
export const onBulletChange = new Signal<[number, Vector3, Vector3]>();
export const onBulletDestroy = new Signal<[number]>();

let room: Room<State> | null = null;
export async function connect(userLnInfo: UserLnInfo) {
  try {
    room = await client.joinOrCreate("game-room", { userLnInfo }, State);

    room.onStateChange.once(() => {
      if (room) onFirstState.emit(room.state);
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
    room.onMessage("bullet-destroy", (id) => {
      onBulletDestroy.emit(parseInt(id));
    });

    room.state.players.onAdd = (player) => {
      if (player.id === room?.sessionId) return;
      onPlayerJoin.emit(player);

      player.position.onChange = (position) => onPlayerPositionChange.emit(player);
    };
    room.state.players.onRemove = (player) => {
      if (player.id === room?.sessionId) return;
      onPlayerLeave.emit(player);
    };
    room.state.onChange = (changes) => {
      for (const change of changes) {
        if (change.field === "time") {
          onTimeChange.emit(change.value);
        }
      }
    };

    onJoin.emit(room);
    return room;
  } catch (e) {
    console.error("Couldn't connect:", e);
  }
}

export function getRoom() {
  return room;
}
