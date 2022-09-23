import { Box3, Box3Helper, BufferGeometry, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { vecToIndex } from "../utils/3d-array";
import { FACE, voxelFaceGenerator } from "../utils/voxel-chunk";
import { VoxelChunk, VoxelWorld } from "../voxel-world";

export class VoxelWorldObject extends Group {
  world: VoxelWorld;
  chunkObjects: VoxelChunkObject[] = [];
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

      const mesh = new VoxelChunkMesh(chunk);
      mesh.position.copy(v).multiply(chunk.size);
      this.add(mesh);
    }
  }

  getChunkObject(v: Vector3) {
    if (this.world.isOutOfBounds(v)) throw new Error("chunk out of bounds");
    let chunkObject = this.chunkObjects[vecToIndex(v, this.world.size)];

    if (!chunkObject) {
      chunkObject = new VoxelChunkObject(this.world.getChunk(v));
      this.add(chunkObject);
    }

    return chunkObject;
  }

  update() {
    for (const [v, chunk] of this.world) {
      let chunkObject = this.getChunkObject(v);

      if (chunkObject.isDirty) {
        chunkObject.update();
      }
    }
  }
}

export class VoxelChunkObject extends Group {
  chunk: VoxelChunk;
  isDirty = false;

  constructor(chunk: VoxelChunk) {
    super();
    this.chunk = chunk;
    this.update();
  }

  update() {
    this.clear();
    this.add(new VoxelChunkMesh(this.chunk));
    this.isDirty = false;
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
