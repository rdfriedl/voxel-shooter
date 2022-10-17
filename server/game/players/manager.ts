import { Client } from "colyseus";
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

  setup() {
    this.room.onMessage("position", (client, message) => {
      const player = this.players.get(client.sessionId);
      if (player) {
        player.setPosition(message.position, message.velocity);
      }
    });

    this.room.onMessage("respawn", (client) => {
      const player = this.players.get(client.sessionId);
      if (player) {
        const position = new Vector3(Math.random() * 500, 100, Math.random() * 500);
        player.respawn(position);
        client.send("respawn", position.toArray());
      }
    });
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
      // skip the player if they are ignored or dead
      if (player === ignore || !player.state.alive) continue;
      const intersection = this.ray.intersectBox(player.hitbox, v);
      if (intersection) return { point: intersection, player };
    }
    return null;
  }

  update(dt: number) {
    for (const [id, player] of this.players) {
      player.update(dt);

      if (player.position.y < -200 && player.state.alive) {
        player.damage(100);
      }
    }
  }
}
