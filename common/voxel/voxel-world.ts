import { Vector3 } from "three";
import { DEFAULT_PALETTE } from "../utils/color";
import { indexToVec, vecToString } from "../utils/vector";
import { VoxelChunk } from "./voxel-chunk";

export class VoxelWorld {
  size: Vector3;
  chunks: Map<string, VoxelChunk> = new Map();
  chunkSize: number;
  palette: number[];
  voxelSize: Vector3;

  constructor(chunkSize: number, size: Vector3, palette = DEFAULT_PALETTE) {
    this.size = size;
    this.chunkSize = chunkSize;
    this.palette = palette;

    this.voxelSize = size.clone().multiplyScalar(chunkSize);
  }

  getChunkKey(v: Vector3) {
    return vecToString(v);
  }
  getChunkVector(index: number) {
    return indexToVec(index, this.size);
  }

  isChunkOutOfBounds(vec: Vector3) {
    return vec.x < 0 || vec.y < 0 || vec.z < 0 || vec.x >= this.size.x || vec.y >= this.size.y || vec.z >= this.size.z;
  }
  isVoxelOutOfBounds(vec: Vector3) {
    return (
      vec.x < 0 || vec.y < 0 || vec.z < 0 || vec.x >= this.voxelSize.x || vec.y >= this.voxelSize.y || vec.z >= this.voxelSize.z
    );
  }

  getChunk(vec: Vector3, create = true) {
    if (this.isChunkOutOfBounds(vec)) return;
    const key = this.getChunkKey(vec);
    let chunk = this.chunks.get(key);
    if (!chunk && create) {
      chunk = new VoxelChunk(this.chunkSize, this, vec);
      this.chunks.set(key, chunk);
    }
    return chunk;
  }

  getVoxel(vec: Vector3) {
    if (this.isVoxelOutOfBounds(vec)) return 0;
    const chunkCords = vec.clone().divideScalar(this.chunkSize).floor();
    const chunk = this.getChunk(chunkCords);
    if (!chunk) return 0;
    return chunk.getVoxel(vec.clone().sub(chunkCords.multiplyScalar(this.chunkSize)));
  }
  setVoxel(vec: Vector3, value: number) {
    if (this.isVoxelOutOfBounds(vec)) return;
    const chunkCords = vec.clone().divideScalar(this.chunkSize).floor();
    const chunk = this.getChunk(chunkCords);
    if (!chunk) return;
    chunk.setVoxel(vec.clone().sub(chunkCords.multiplyScalar(this.chunkSize)), value);
  }

  resize(newSize: Vector3) {
    this.size.copy(newSize);
    this.voxelSize.copy(this.size).multiplyScalar(this.chunkSize);

    // remove chunks outside map
    for (const [key, chunk] of this.chunks) {
      const v = chunk.position;
      if (v.x < newSize.x && v.y < newSize.y && v.z < newSize.z) {
        this.chunks.delete(key);
      }
    }
  }

  [Symbol.iterator]() {
    return this.chunks[Symbol.iterator]();
  }
}
