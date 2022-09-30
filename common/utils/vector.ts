import { Vector3 } from "three";

export type VectorLike = {
  x: number;
  y: number;
  z: number;
};

export function vecToIndex(vec: VectorLike, size: VectorLike) {
  const offsety = size.x;
  const offsetz = offsety * size.y;
  return vec.x + vec.y * offsety + vec.z * offsetz;
}
export function indexToVec(index: number, size: VectorLike) {
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

export function vecToString(vec: VectorLike) {
  return `${vec.x}-${vec.y}-${vec.z}`;
}
export function setFromString(v: VectorLike, string: string) {
  const components = string.split("-");
  v.x = parseFloat(components[0]);
  v.y = parseFloat(components[1]);
  v.z = parseFloat(components[2]);
  return v;
}
