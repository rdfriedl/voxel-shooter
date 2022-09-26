import { MapSchema, Schema, type } from "@colyseus/schema";

export class Vector extends Schema {
  @type("number") x = 0;
  @type("number") y = 0;
  @type("number") z = 0;
}

export class Player extends Schema {
  @type("number") health = 100;
  @type(Vector) position = new Vector();
  @type(Vector) velocity = new Vector();
}

export class State extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();

  // createPlayer(sessionId: string) {
  //   const player = new Player();
  //   // player.position.x = Math.floor(Math.random() * 1000);
  //   // player.position.y = Math.floor(Math.random() * 1000);
  //   // player.position.z = Math.floor(Math.random() * 1000);
  //   this.players.set(sessionId, player);
  //   return player;
  // }

  // removePlayer(sessionId: string) {
  //   this.players.delete(sessionId);
  // }

  // movePlayer(sessionId: string, position: Vector, velocity: Vector) {
  //   const player = this.players.get(sessionId);
  //   if (player) {
  //     player.position = position;
  //     player.velocity = velocity;
  //   }
  // }
}
