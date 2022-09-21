import { Vector3 } from "three";
import { Address, Octree } from "./octree";

function sumColors(colors: number[]) {
  const filteredColors = colors.filter((c) => c !== 0);
  const r =
    0xff &
    (filteredColors.reduce((v, color) => v + (0xff & color), 0) /
      filteredColors.length);
  const g =
    0xff &
    (filteredColors.reduce((v, color) => v + (0xff & (color >> 8)), 0) /
      filteredColors.length);
  const b =
    0xff &
    (filteredColors.reduce((v, color) => v + (0xff & (color >> 16)), 0) /
      filteredColors.length);
  return r | (g << 8) | (b << 16);
}

export class VoxelWorld {
  size: number;
  levels: number;
  tree: Octree;

  constructor(levels: number) {
    const size = Math.pow(2, levels);
    this.size = size;
    this.levels = levels;

    this.tree = new Octree(8, sumColors);

    if (levels < 1) throw new Error("levels must be greater than 1");
  }

  getVoxelAddress(vec: Vector3) {
    if (this.vec3OutOfBounds(vec)) {
      throw new Error("out of bounds");
    }
    const address = new Address();
    const v = vec.clone();
    // const offset = new Vector3();
    let size = this.size;

    let level = this.levels;
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
  vec3OutOfBounds(vec: Vector3) {
    return (
      vec.x < 0 ||
      vec.y < 0 ||
      vec.z < 0 ||
      vec.x >= this.size ||
      vec.y >= this.size ||
      vec.z >= this.size
    );
  }

  getVoxel(vec: Vector3) {
    return this.tree.recursiveGetValue(this.getVoxelAddress(vec));
  }
  setVoxel(vec: Vector3, value: number, makeDirty = false) {
    const address = this.getVoxelAddress(vec);
    return this.tree.recursiveSetValue(address, value, makeDirty);
  }

  update(force = false) {
    this.tree.update(force);
  }
}
