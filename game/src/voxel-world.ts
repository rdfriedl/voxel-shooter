import { Vector3 } from "three";
import { DEFAULT_PALETTE } from "./color";
import { vecToIndex } from "./utils/3d-array";

function tmpPickFirstColor(colors: number[]) {
  return colors.find((c) => c !== 0) || 0;
}

export class VoxelChunk {
  size: Vector3;
  data: Uint8Array;
  world: VoxelWorld;

  constructor(size: number, world: VoxelWorld) {
    this.size = new Vector3(size, size, size);
    if (size < 1) throw new Error("size must be greater than 1");

    this.world = world;
    this.data = new Uint8Array(size * size * size);
  }

  isOutOfBounds(vec: Vector3) {
    return vec.x < 0 || vec.y < 0 || vec.z < 0 || vec.x >= this.size.x || vec.y >= this.size.y || vec.z >= this.size.z;
  }

  getVoxel(vec: Vector3) {
    if (this.isOutOfBounds(vec)) {
      throw new Error("out of bounds");
    }
    return this.data[vecToIndex(vec, this.size)];
  }
  setVoxel(vec: Vector3, value: number) {
    if (this.isOutOfBounds(vec)) {
      throw new Error("out of bounds");
    }
    this.data[vecToIndex(vec, this.size)] = value;
  }

  get isEmpty() {
    return this.data.some((v) => v !== 0);
  }

  *[Symbol.iterator]() {
    const v = new Vector3();
    let i = 0;
    for (let z = 0; z < this.size.z; z++) {
      for (let y = 0; y < this.size.y; y++) {
        for (let x = 0; x < this.size.x; x++) {
          v.set(x, y, z);
          yield [v, this.data[i]] as const;
          i++;
        }
      }
    }
  }
}

export class VoxelWorld {
  size: Vector3;
  chunks: VoxelChunk[] = [];
  chunkSize: number;
  palette: number[];

  constructor(chunkSize: number, size: Vector3, palette = DEFAULT_PALETTE) {
    this.size = size;
    this.chunkSize = chunkSize;
    this.palette = palette;
  }

  isOutOfBounds(vec: Vector3) {
    return (
      vec.x < 0 ||
      vec.y < 0 ||
      vec.z < 0 ||
      vec.x >= this.size.x * this.chunkSize ||
      vec.y >= this.size.y * this.chunkSize ||
      vec.z >= this.size.z * this.chunkSize
    );
  }

  getChunk(vec: Vector3) {
    const index = vecToIndex(vec, this.size);
    if (!this.chunks[index]) {
      this.chunks[index] = new VoxelChunk(this.chunkSize, this);
    }
    return this.chunks[index];
  }

  getVoxel(vec: Vector3) {
    if (this.isOutOfBounds(vec)) return 0;
    const chunkCords = vec.clone().divideScalar(this.chunkSize).floor();
    const chunk = this.getChunk(chunkCords);
    return chunk.getVoxel(vec.clone().sub(chunkCords.multiplyScalar(this.chunkSize)));
  }
  setVoxel(vec: Vector3, value: number) {
    if (this.isOutOfBounds(vec)) return;
    const chunkCords = vec.clone().divideScalar(this.chunkSize).floor();
    const chunk = this.getChunk(chunkCords);
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
