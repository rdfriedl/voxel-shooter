import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";

export type UserLnInfo = {
  address?: string;
  webln: boolean;
};

export class Vector extends Schema {
  @type("number") x = 0;
  @type("number") y = 0;
  @type("number") z = 0;
}

export class Position extends Schema {
  @type("number") px = 0;
  @type("number") py = 0;
  @type("number") pz = 0;
  @type("number") vx = 0;
  @type("number") vy = 0;
  @type("number") vz = 0;
}

export class Player extends Schema {
  @type("string") id = "";
  @type("number") health = 100;
  @type(Position) position = new Position();
}

export class VoxelWorld extends Schema {
  @type({ map: "string" }) chunks = new MapSchema<string, string>();
  @type(["number"]) palette = new ArraySchema<number>();
  @type(Vector) size = new Vector();
}

export class State extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type(VoxelWorld) world = new VoxelWorld();
}
