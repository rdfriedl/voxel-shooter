import { FileLoader } from "three";
import { readVoxChunksIntoWorld, readVoxModelChunks } from "./vox-loader";
import { VoxelWorld } from "./voxel-world";

const world = new VoxelWorld(8);

console.log(world);

const loader = new FileLoader();
loader.setResponseType("arraybuffer");
loader.load("/models/monu10.vox", (buffer) => {
  if (buffer instanceof ArrayBuffer) {
    console.time("load");
    const chunks = readVoxModelChunks(buffer);
    readVoxChunksIntoWorld(chunks, world);
    console.timeEnd("load");
  }
});
