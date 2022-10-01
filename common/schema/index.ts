import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";

export type UserLnInfo = {
  address?: string;
  webln: boolean;
};

export class Vector extends Schema {
  @type("number") x = 0;
  @type("number") y = 0;
  @type("number") z = 0;

  copy(vector: { x: number; y: number; z: number }) {
    this.x = vector.x;
    this.y = vector.y;
    this.z = vector.z;
  }
}

export class Player extends Schema {
  @type("string") id = "";
  @type("number") health = 100;
  @type(Vector) position = new Vector();
  @type(Vector) velocity = new Vector();
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
