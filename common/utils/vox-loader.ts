import { Vector3 } from "three";
import { DEFAULT_PALETTE } from "./color";
import { VoxelWorld } from "../voxel";

export type VoxChunk = {
  palette: number[];
  size: { x: number; y: number; z: number };
  data: Uint8Array;
};
export function readVoxModelChunks(buffer: ArrayBuffer) {
  const data = new DataView(buffer);

  const id = data.getUint32(0, true);
  const version = data.getUint32(4, true);

  if (id !== 542658390 || version !== 150) {
    throw new Error("Not a valid VOX file");
  }

  let i = 8;

  let chunk: VoxChunk;
  const chunks: VoxChunk[] = [];

  while (i < data.byteLength) {
    let id = "";

    for (let j = 0; j < 4; j++) {
      id += String.fromCharCode(data.getUint8(i++));
    }

    const chunkSize = data.getUint32(i, true);
    i += 4;
    i += 4; // childChunks

    if (id === "SIZE") {
      const x = data.getUint32(i, true);
      i += 4;
      const y = data.getUint32(i, true);
      i += 4;
      const z = data.getUint32(i, true);
      i += 4;

      // @ts-ignore
      chunk = {
        palette: DEFAULT_PALETTE,
        size: { x, y, z },
      };

      chunks.push(chunk);

      i += chunkSize - 3 * 4;
    } else if (id === "XYZI") {
      const numVoxels = data.getUint32(i, true);
      i += 4;
      // @ts-ignore
      chunk.data = new Uint8Array(buffer, i, numVoxels * 4);

      i += numVoxels * 4;
    } else if (id === "RGBA") {
      const palette = [0];

      for (let j = 0; j < 256; j++) {
        palette[j + 1] = data.getUint32(i, true);
        i += 4;
      }

      // @ts-ignore
      chunk.palette = palette;
    } else {
      i += chunkSize;
    }
  }

  return chunks;
}
export function readVoxChunksIntoWorld(chunks: VoxChunk[], world: VoxelWorld) {
  const v = new Vector3();
  const set = (x, y, z, c) => world.setVoxel(v.set(y, z, x), c);
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.data.length; i += 4) {
      const x = chunk.data[i + 0] * 2;
      const y = chunk.data[i + 1] * 2;
      const z = chunk.data[i + 2] * 2;
      const c = chunk.data[i + 3];

      set(x, y, z, c);
      set(x, y + 1, z, c);
      set(x, y, z + 1, c);
      set(x + 1, y, z, c);
      set(x + 1, y + 1, z, c);
      set(x + 1, y + 1, z + 1, c);
      set(x, y + 1, z + 1, c);
      set(x + 1, y, z + 1, c);
    }

    world.palette = chunk.palette;
  }
}
