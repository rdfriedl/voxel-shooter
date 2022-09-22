import { Vector3 } from "three";
import { DEFAULT_PALETTE, maybeBlendColors } from "./color";
import { FastOctree } from "./fast-octree";
import { cachedPow2 } from "./math";
import { Address } from "./octree";

export function getOctreeAddress(vec: Vector3, levels: number) {
  const address = new Address();
  const v = vec.clone();
  let size = cachedPow2(levels);

  let level = levels;
  while (level > 0) {
    level--;
    size /= 2;
    let addr = 0;
    if (v.x >= size) {
      addr |= 1;
      v.x -= size;
    }
    if (v.y >= size) {
      addr |= 2;
      v.y -= size;
    }
    if (v.z >= size) {
      addr |= 4;
      v.z -= size;
    }
    address.push(addr);
  }

  return address;
}

function tmpPickFirstColor(colors: number[]) {
  return colors.find((c) => c !== 0) || 0;
}

export class VoxelChunk {
  size: number;
  levels: number;
  tree: FastOctree;
  world: VoxelWorld;

  constructor(levels: number, world: VoxelWorld) {
    const size = Math.pow(2, levels);
    this.size = size;
    this.levels = levels;
    if (levels < 1) throw new Error("levels must be greater than 1");

    this.world = world;
    this.tree = new FastOctree(tmpPickFirstColor);
  }

  isOutOfBounds(vec: Vector3, lod = this.levels) {
    const size = cachedPow2(lod);
    return vec.x < 0 || vec.y < 0 || vec.z < 0 || vec.x >= size || vec.y >= size || vec.z >= size;
  }

  getVoxel(vec: Vector3, lod = this.levels) {
    if (this.isOutOfBounds(vec, lod)) {
      throw new Error("out of bounds");
    }
    const address = getOctreeAddress(vec, lod);
    const value = this.tree.get(address);
    if (typeof value !== "number") {
      throw new Error("failed to get voxel value");
    }
    return value;
  }
  setVoxel(vec: Vector3, value: number, lod = this.levels) {
    if (this.isOutOfBounds(vec, lod)) {
      throw new Error("out of bounds");
    }
    const address = getOctreeAddress(vec, lod);
    return this.tree.set(address, value);
  }

  update() {
    this.tree.update();
  }
}

export class VoxelWorld {
  size: Vector3;
  chunks: VoxelChunk[] = [];
  chunkLevels: number;
  chunkSize: number;
  colorPalette: number[];

  constructor(chunkLevels: number, size: Vector3, colorPalette = DEFAULT_PALETTE) {
    this.size = size;
    this.chunkLevels = chunkLevels;
    this.chunkSize = Math.pow(2, chunkLevels);
    this.colorPalette = colorPalette;
  }

  getChunkIndex(vec: Vector3) {
    return vec.x + vec.y * this.size.x + vec.z * this.size.x * this.size.y;
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
    const index = this.getChunkIndex(vec);
    if (!this.chunks[index]) {
      this.chunks[index] = new VoxelChunk(this.chunkLevels, this);
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

  update() {
    for (const chunk of this.chunks) {
      if (chunk) chunk.update();
    }
  }
}
