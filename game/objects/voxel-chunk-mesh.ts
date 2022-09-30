import { BufferGeometry, Float32BufferAttribute, BufferAttribute, Mesh, MeshStandardMaterial } from "three";
import { VoxelChunk, FACE, voxelFaceGenerator } from "../../common/voxel";

const nx = [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1];
const px = [1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0];
const py = [0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1];
const ny = [0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0];
const pz = [0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1];
const nz = [0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0];

export class VoxelChunkMesh extends Mesh {
  chunk: VoxelChunk;
  geometry = new BufferGeometry();
  material = new MeshStandardMaterial();
  constructor(chunk: VoxelChunk) {
    super();
    this.chunk = chunk;
    this.update();
  }

  update() {
    const palette = this.chunk.world.palette;

    const vertices: number[] = [];
    const colors: number[] = [];

    function add(tile: number[], x: number, y: number, z: number, r: number, g: number, b: number) {
      for (let i = 0; i < 18; i += 3) {
        vertices.push(tile[i + 0] + x, tile[i + 1] + y, tile[i + 2] + z);
        colors.push(r, g, b);
      }
    }

    const generator = voxelFaceGenerator(this.chunk);

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

    this.geometry.setAttribute("position", new BufferAttribute(new Uint8Array(vertices), 3));
    this.geometry.computeVertexNormals();

    if (hasColors) {
      this.geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
      this.material.vertexColors = true;
    }
  }
}
