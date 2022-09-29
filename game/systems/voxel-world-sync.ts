import { System } from "ecsy";
import { Vector3 } from "three";
import { getRoom } from "../connection";
import { VoxelWorldSystem } from "./voxel-world";

export class VoxelWorldSyncSystem extends System {
  chunkChanges: [string, string][] = [];
  palette: number[] = [];
  size: Vector3 = new Vector3();
  init() {
    const room = getRoom();
    if (!room) throw new Error("Room not connected");

    // read current data
    room.state.world.chunks.forEach((item, key) => {
      this.chunkChanges.push([key, item]);
    });

    // listen for changes
    room.state.world.chunks.onAdd = (item, key) => {
      this.chunkChanges.push([key, item]);
    };
    room.state.world.chunks.onChange = (item, key) => {
      this.chunkChanges.push([key, item]);
    };
    room.state.world.listen("palette", (value) => {
      this.getVoxelWorld().palette = value.toArray();
    });

    const voxelWorld = this.getVoxelWorld();
    if (!voxelWorld) return;

    // setup
    // @ts-ignore
    voxelWorld.resize(room.state.world.size);
    voxelWorld.palette = room.state.world.palette.toArray();
  }
  getVoxelWorld() {
    return this.world.getSystem(VoxelWorldSystem).voxelWorld;
  }
  execute() {
    const voxelWorld = this.world.getSystem(VoxelWorldSystem).voxelWorld;
    if (!voxelWorld) return;

    const v = new Vector3();
    for (const [key, encoded] of this.chunkChanges) {
      v.fromArray(key.split("-").map((v) => parseInt(v)));
      const chunk = voxelWorld.getChunk(v);
      if (!chunk) throw new Error("Cant get chunk for world");
      chunk.decode(encoded);
    }
    this.chunkChanges = [];
  }
}
