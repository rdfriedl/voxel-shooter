import { MapSchema, Schema, type } from "@colyseus/schema";

// export class Vector extends Schema {
//   @type("number") x = Math.floor(Math.random() * 400);
//   @type("number") y = Math.floor(Math.random() * 400);
//   @type("number") z = Math.floor(Math.random() * 400);
// }

export class Player extends Schema {
  @type("number") health = 100;
  @type("number") px = Math.floor(Math.random() * 400);
  @type("number") py = Math.floor(Math.random() * 400);
  @type("number") pz = Math.floor(Math.random() * 400);
  @type("number") vx = Math.floor(Math.random() * 400);
  @type("number") vy = Math.floor(Math.random() * 400);
  @type("number") vz = Math.floor(Math.random() * 400);
  // @type(Vector) position = new Vector();
  // @type(Vector) velocity = new Vector();
}

export class State extends Schema {
  @type("number") timeLeft = 60;
  @type({ map: Player }) players = new MapSchema<Player>();

  createPlayer(sessionId: string) {
    const player = new Player();
    // player.position.x = Math.floor(Math.random() * 1000);
    // player.position.y = Math.floor(Math.random() * 1000);
    // player.position.z = Math.floor(Math.random() * 1000);
    this.players.set(sessionId, player);
    return player;
  }

  removePlayer(sessionId: string) {
    this.players.delete(sessionId);
  }

  // movePlayer(sessionId: string, position: Vector, velocity: Vector) {
  //   const player = this.players.get(sessionId);
  //   if (player) {
  //     player.position = position;
  //     player.velocity = velocity;
  //   }
  // }
}
