import { BufferGeometry, Float32BufferAttribute, BufferAttribute, Group, Mesh, MeshStandardMaterial } from "three";
import { vecToIndex } from "../../common/utils/3d-array";
import { VoxelChunk, VoxelWorld, FACE, voxelFaceGenerator } from "../../common/voxel";

export class VoxelWorldMesh extends Group {
  world: VoxelWorld;
  chunks: VoxelChunkMesh[] = [];
  constructor(world: VoxelWorld) {
    super();

    this.world = world;
  }

  update() {
    for (const [v, chunk] of this.world) {
      const index = vecToIndex(v, this.world.size);
      if (!this.chunks[index] || chunk.dirty) {
        this.chunks[index]?.removeFromParent();
        const mesh = (this.chunks[index] = new VoxelChunkMesh(chunk));
        mesh.position.copy(v).multiply(chunk.size);
        this.add(mesh);
        chunk.dirty = false;
      }
    }
  }
}

const nx = [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1];
const px = [1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0];
const py = [0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1];
const ny = [0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0];
const pz = [0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1];
const nz = [0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0];

export class VoxelChunkMesh extends Mesh {
  constructor(chunk: VoxelChunk) {
    const palette = chunk.world.palette;

    const vertices: number[] = [];
    const colors: number[] = [];

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
    geometry.setAttribute("position", new BufferAttribute(new Uint8Array(vertices), 3));
    geometry.computeVertexNormals();

    const material = new MeshStandardMaterial();
    if (hasColors) {
      geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
      material.vertexColors = true;
    }

    super(geometry, material);
  }
}
