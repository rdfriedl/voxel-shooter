import { Box3, Box3Helper, BufferGeometry, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { VoxelChunk, VoxelWorld } from "./voxel-world";

export class VoxelWorldMesh extends Group {
  world: VoxelWorld;
  constructor(world: VoxelWorld) {
    super();

    this.world = world;

    // const box = new Box3();
    // box.min.set(0, 0, 0);
    // box.max.copy(world.size).multiplyScalar(world.chunkSize);
    // this.add(new Box3Helper(box));

    for (const [v, chunk] of world) {
      // const box = new Box3();
      // box.min.copy(v).multiply(chunk.size);
      // box.max.copy(box.min).add(chunk.size);
      // this.add(new Box3Helper(box));

      const mesh = new VOXMesh(chunk);
      mesh.position.copy(v).multiply(chunk.size);
      this.add(mesh);
    }
  }
}

class VOXMesh extends Mesh {
  constructor(chunk: VoxelChunk) {
    const size = chunk.size;
    const palette = chunk.world.palette;

    const vertices: number[] = [];
    const colors: number[] = [];

    const nx = [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1];
    const px = [1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0];
    const py = [0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1];
    const ny = [0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0];
    const pz = [0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1];
    const nz = [0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0];

    function add(tile: number[], x: number, y: number, z: number, r: number, g: number, b: number) {
      for (let i = 0; i < 18; i += 3) {
        vertices.push(tile[i + 0] + x, tile[i + 1] + y, tile[i + 2] + z);
        colors.push(r, g, b);
      }
    }

    // Store data in a volume for sampling
    const offsety = size.x;
    const offsetz = size.x * size.y;
    const array = chunk.data;

    // Construct geometry
    let hasColors = false;
    for (const [v, c] of chunk) {
      const { x, y, z } = v;
      if (c === 0) continue;
      const hex = palette[c];
      const r = ((hex >> 0) & 0xff) / 0xff;
      const g = ((hex >> 8) & 0xff) / 0xff;
      const b = ((hex >> 16) & 0xff) / 0xff;

      if (r > 0 || g > 0 || b > 0) hasColors = true;

      const index = x + y * offsety + z * offsetz;
      if (array[index + 1] === 0 || x === size.x - 1) add(px, x, y, z, r, g, b);
      if (array[index - 1] === 0 || x === 0) add(nx, x, y, z, r, g, b);
      if (array[index + offsety] === 0 || y === size.y - 1) add(py, x, y, z, r, g, b);
      if (array[index - offsety] === 0 || y === 0) add(ny, x, y, z, r, g, b);
      if (array[index + offsetz] === 0 || z === size.z - 1) add(pz, x, y, z, r, g, b);
      if (array[index - offsetz] === 0 || z === 0) add(nz, x, y, z, r, g, b);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    geometry.computeVertexNormals();

    const material = new MeshStandardMaterial();
    if (hasColors) {
      geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
      material.vertexColors = true;
    }

    super(geometry, material);
  }
}
