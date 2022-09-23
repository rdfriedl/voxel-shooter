import { VoxelChunk } from "../voxel-world";

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
