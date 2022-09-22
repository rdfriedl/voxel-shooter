import { Vector3 } from "three";

export function vecToIndex(vec: Vector3, size: Vector3) {
  const offsety = size.x;
  const offsetz = offsety * size.y;
  return vec.x + vec.y * offsety + vec.z * offsetz;
}
export function indexToVec(index: number, size: Vector3) {
  const offsety = size.x;
  const offsetz = offsety * size.y;
  const v = new Vector3();
  let i = index;
  v.z = Math.floor(i / offsetz);
  i -= v.z * offsetz;
  v.y = Math.floor(i / offsety);
  i -= v.y * offsety;
  v.x = i;
  return v;
}
