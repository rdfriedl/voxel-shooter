import { Ray, Vector3 } from "three";
import { PlayerState } from "../../../common/schema";
import { GameRoom } from "../../rooms/game-room";
import { Player } from "./player";

export class PlayerManager {
  room: GameRoom;
  players: Map<string, Player> = new Map();
  constructor(room: GameRoom) {
    this.room = room;
  }

  getPlayer(id: string) {
    return this.players.get(id);
  }
  createPlayer(state: PlayerState) {
    const player = new Player(state, this);
    this.players.set(state.id, player);
    return player;
  }
  removePlayer(id: string) {
    this.players.delete(id);
  }

  ray = new Ray();
  intersectRay(origin: Vector3, target: Vector3, ignore?: Player) {
    this.ray.origin.copy(origin);
    this.ray.lookAt(target);

    const v = new Vector3();
    for (const [id, player] of this.players) {
      if (player === ignore) return;
      const intersection = this.ray.intersectBox(player.hitbox, v);
      if (intersection) return { point: intersection, player };
    }
    return null;
  }

  update(dt: number) {
    for (const [id, player] of this.players) {
      player.update(dt);
    }
  }
}
