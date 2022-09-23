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

const FACE = {
  NX: 1 << 0,
  PX: 1 << 1,
  NY: 1 << 2,
  PY: 1 << 3,
  NZ: 1 << 4,
  PZ: 1 << 5,
};
function* voxelFaceGenerator(chunk: VoxelChunk) {
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

class VOXMesh extends Mesh {
  constructor(chunk: VoxelChunk) {
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

    const generator = voxelFaceGenerator(chunk);

    // Construct geometry
    let hasColors = false;
    for (const [v, color, faces] of generator) {
      const { x, y, z } = v;
      const hex = palette[color];
      const r = ((hex >> 0) & 0xff) / 0xff;
      const g = ((hex >> 8) & 0xff) / 0xff;
      const b = ((hex >> 16) & 0xff) / 0xff;

      if (r > 0 || g > 0 || b > 0) hasColors = true;

      if (faces & FACE.PX) add(px, x, y, z, r, g, b);
      if (faces & FACE.NX) add(nx, x, y, z, r, g, b);
      if (faces & FACE.PY) add(py, x, y, z, r, g, b);
      if (faces & FACE.NY) add(ny, x, y, z, r, g, b);
      if (faces & FACE.PZ) add(pz, x, y, z, r, g, b);
      if (faces & FACE.NZ) add(nz, x, y, z, r, g, b);
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
