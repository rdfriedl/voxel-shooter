import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import { Vector3 } from "three";

export type UserLnInfo = {
  address?: string;
  webln: boolean;
};

export class VectorState extends Schema {
  @type("number") x = 0;
  @type("number") y = 0;
  @type("number") z = 0;

  v = new Vector3();
  toVector() {
    return this.v.set(this.x, this.y, this.z);
  }
}

export class PositionState extends Schema {
  @type("number") px = 0;
  @type("number") py = 0;
  @type("number") pz = 0;
  @type("number") vx = 0;
  @type("number") vy = 0;
  @type("number") vz = 0;

  pv = new Vector3();
  getPositionVector() {
    return this.pv.set(this.px, this.py, this.pz);
  }
  vv = new Vector3();
  getVelocityVector() {
    return this.vv.set(this.vx, this.vy, this.vz);
  }
}

export class PlayerState extends Schema {
  @type("string") id = "";
  @type("number") health = 100;
  @type("boolean") alive = false;
  @type(PositionState) position = new PositionState();
}

export class VoxelWorldState extends Schema {
  @type({ map: "string" }) chunks = new MapSchema<string, string>();
  @type(["number"]) palette = new ArraySchema<number>();
  @type(VectorState) size = new VectorState();
}

export class State extends Schema {
  @type("number") time = 0;
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type(VoxelWorldState) world = new VoxelWorldState();
}
