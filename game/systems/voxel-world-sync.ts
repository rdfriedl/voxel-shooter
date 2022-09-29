import { System } from "ecsy";
import { Vector3 } from "three";
import { getRoom } from "../connection";
import { VoxelWorldSystem } from "./voxel-world";

export class VoxelWorldSyncSystem extends System {
  changes: [string, string][] = [];
  palette: number[] = [];
  init() {
    const room = getRoom();
    if (!room) throw new Error("Room not connected");

    room.state.chunks.onAdd = (item, key) => {
      this.changes.push([key, item]);
    };
    room.state.chunks.onChange = (item, key) => {
      this.changes.push([key, item]);
    };

    room.state.chunks.forEach((item, key) => {
      this.changes.push([key, item]);
    });

    this.palette = room.state.palette.toArray();
  }
  execute() {
    const voxelWorld = this.world.getSystem(VoxelWorldSystem).voxelWorld;
    if (!voxelWorld) return;

    voxelWorld.palette = this.palette;
    const v = new Vector3();
    for (const [key, encoded] of this.changes) {
      v.fromArray(key.split("-").map((v) => parseInt(v)));
      const chunk = voxelWorld.getChunk(v);
      if (!chunk) throw new Error("Cant get chunk for world");
      chunk.decode(encoded);
    }
    this.changes = [];
  }
}
