import { Entity, System } from "ecsy";
import { Vector3 } from "three";
import { vecToString } from "../../common/utils/vector";
import { VoxelChunk, VoxelWorld } from "../../common/voxel";
import { Object3DComponent } from "../components/object3D";
import { Movement } from "../components/movement";
import { getRoom } from "../connection";
import { VoxelChunkMesh } from "../objects/voxel-chunk-mesh";
import { PlayerCollisionTag } from "../components/tags";

export class VoxelWorldSystem extends System {
  chunkChanges: [string, string][] = [];
  palette: number[] = [];
  size: Vector3 = new Vector3();

  chunks: Map<string, Entity> = new Map();

  voxelWorld: VoxelWorld = new VoxelWorld(16, new Vector3(8, 8, 8));

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
      this.voxelWorld.palette = value.toArray();
    });

    // setup
    // @ts-ignore
    this.voxelWorld.resize(room.state.world.size);
    this.voxelWorld.palette = room.state.world.palette.toArray();
  }
  execute() {
    const v = new Vector3();
    for (const [key, encoded] of this.chunkChanges) {
      v.fromArray(key.split("-").map((v) => parseInt(v)));
      const chunk = this.voxelWorld.getChunk(v);
      if (!chunk) throw new Error("Cant get chunk for world");
      chunk.decode(encoded);
    }
    this.chunkChanges = [];

    for (const [key, chunk] of this.voxelWorld) {
      if (chunk.dirty) {
        let entity = this.chunks.get(key);

        if (entity) {
          (entity.getComponent(Object3DComponent)?.object as VoxelChunkMesh).update();
        } else {
          this.createChunkEntity(chunk);
        }
        chunk.dirty = false;
      }
    }
  }

  createChunkEntity(chunk: VoxelChunk) {
    const key = vecToString(chunk.position);
    const name = `chunk-${key}`;
    const mesh = new VoxelChunkMesh(chunk);
    mesh.name = name;
    const entity = this.world
      .createEntity(name)
      .addComponent(Object3DComponent, { object: mesh })
      .addComponent(Movement, { position: chunk.position.clone().multiplyScalar(this.voxelWorld.chunkSize) })
      .addComponent(PlayerCollisionTag);

    this.chunks.set(key, entity);
    return entity;
  }
}
