import { Vector3 } from "three";
import { DEFAULT_PALETTE } from "../../game/color";
import { vecToIndex } from "../utils/3d-array";
import { VoxelChunk } from "./voxel-chunk";

export class VoxelWorld {
  size: Vector3;
  chunks: VoxelChunk[] = [];
  chunkSize: number;
  palette: number[];
  voxelSize: Vector3;

  constructor(chunkSize: number, size: Vector3, palette = DEFAULT_PALETTE) {
    this.size = size;
    this.chunkSize = chunkSize;
    this.palette = palette;

    this.voxelSize = size.clone().multiplyScalar(chunkSize);
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
    const index = vecToIndex(vec, this.size);
    if (!this.chunks[index] && create) {
      this.chunks[index] = new VoxelChunk(this.chunkSize, this);
    }
    return this.chunks[index];
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

  *[Symbol.iterator]() {
    const v = new Vector3();
    let i = 0;
    for (let z = 0; z < this.size.z; z++) {
      for (let y = 0; y < this.size.y; y++) {
        for (let x = 0; x < this.size.x; x++) {
          v.set(x, y, z);
          if (this.chunks[i]) {
            yield [v, this.chunks[i]] as const;
          }
          i++;
        }
      }
    }
  }
}
