import { Vector3 } from "three";
import { Address } from "../octree";
import { cachedPow2 } from "./math";

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
