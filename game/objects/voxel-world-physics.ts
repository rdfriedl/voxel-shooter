import { Body, Box, Vec3, World } from "cannon-es";
import { Vector3 } from "three";
import { VoxelChunk, voxelFaceGenerator, VoxelWorld } from "../../common/voxel";

export class VoxelWorldPhysics {
  world: World;
  voxelWorld: VoxelWorld;

  constructor(world: World, voxelWorld: VoxelWorld) {
    this.world = world;
    this.voxelWorld = voxelWorld;
  }

  addChunkBoxes(position: Vector3) {
    const chunk = this.voxelWorld.getChunk(position);
    if (!chunk) return;

    const generator = voxelFaceGenerator(chunk);
    const boxSize = new Vec3(1, 1, 1);
    for (const [v, color, faces] of generator) {
      if (color === 0) continue;
      const { x, y, z } = v;

      const cube = new Body({ mass: 0, shape: new Box(boxSize) });
      cube.position.set(x, y, z);
      this.world.addBody(cube);
    }
  }
}
