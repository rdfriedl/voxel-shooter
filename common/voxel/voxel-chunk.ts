import { Vector3 } from "three";
import { vecToIndex } from "../utils/3d-array";
import { VoxelWorld } from "./voxel-world";

export class VoxelChunk {
  size: Vector3;
  data: Uint8Array;
  world: VoxelWorld;

  dirty: boolean = false;

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
    this.dirty = true;
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

export const FACE = {
  NX: 1 << 0,
  PX: 1 << 1,
  NY: 1 << 2,
  PY: 1 << 3,
  NZ: 1 << 4,
  PZ: 1 << 5,
};
export function* voxelFaceGenerator(chunk: VoxelChunk) {
  const size = chunk.size;
  const offsety = size.x;
  const offsetz = size.x * size.y;
  const data = chunk.data;

  for (const [v, color] of chunk) {
    const { x, y, z } = v;
    if (color === 0) continue;

    const index = x + y * offsety + z * offsetz;
    let faces = 0;
    if (data[index + 1] === 0 || x === size.x - 1) faces |= FACE.PX;
    if (data[index - 1] === 0 || x === 0) faces |= FACE.NX;
    if (data[index + offsety] === 0 || y === size.y - 1) faces |= FACE.PY;
    if (data[index - offsety] === 0 || y === 0) faces |= FACE.NY;
    if (data[index + offsetz] === 0 || z === size.z - 1) faces |= FACE.PZ;
    if (data[index - offsetz] === 0 || z === 0) faces |= FACE.NZ;
    if (faces !== 0) yield [v, color, faces] as const;
  }
}
