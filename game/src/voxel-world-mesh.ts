import { BufferGeometry, Float32BufferAttribute, Group, Mesh, MeshStandardMaterial, Vector3 } from "three";
import { VOXMesh } from "three/examples/jsm/loaders/VOXLoader";
import { cachedPow2 } from "./math";
import { VoxChunk } from "./vox-loader";
import { getOctreeAddress, VoxelChunk, VoxelWorld } from "./voxel-world";

// export class VoxelWorldChunk extends Group {
//   chunk: VoxelWorld;
//   constructor(chunk: VoxelWorld) {
//     super();

//     this.chunk = chunk;
//   }
// }

export class VoxelWorldMesh extends Group {
  world: VoxelWorld;
  constructor(world: VoxelWorld) {
    super();

    this.world = world;

    const v = new Vector3();
    for (let z = 0; z < world.size.z; z++) {
      for (let y = 0; y < world.size.y; y++) {
        for (let x = 0; x < world.size.x; x++) {
          v.set(x, y, z);
          const chunk = world.getChunk(v);
          const data = this.getLodVoxChunk(chunk, 4);

          const mesh = new VOXMesh(data);
          mesh.position.set(x * chunk.size, y * chunk.size, z * chunk.size);
          mesh.rotateOnAxis(new Vector3(1, 0, 0), Math.PI / 2);
          this.add(mesh);
        }
      }
    }
  }

  getLodVoxChunk(chunk: VoxelChunk, lod: number = 0): VoxChunk {
    const size = cachedPow2(lod);
    if (size === 0) throw new Error("level must be greater than 0");
    const array = [];
    const v = new Vector3();
    for (let z = 0; z < size; z++) {
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          v.set(x, y, z);
          const value = chunk.getVoxel(v, lod);
          if (value !== 0) {
            array.push(x);
            array.push(y);
            array.push(z);
            array.push(value);
          }
        }
      }
    }

    return {
      size: new Vector3(size, size, size),
      palette: this.world.colorPalette,
      data: Uint8Array.from(array),
    };
  }

  // updateLods() {
  //   this.lods = [];
  //   for (let i = 0; i < this.levels; i++) {
  //     const voxChunk = this.getLodVoxChunk(i);
  //     this.lods.push(new VOXMesh(voxChunk));
  //   }
  // }
}

// type ChunkLodData = {
// 	size: Vector3,
// 	palette: number[],
// 	data: Uint8Array,
// }

// class VOXMesh extends Mesh {
//   constructor(chunk: ChunkLodData) {
//     const data = chunk.data;
//     const size = chunk.size;
//     const palette = chunk.palette;

//     const vertices: number[] = [];
//     const colors: number[] = [];

//     const nx = [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1];
//     const px = [1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0];
//     const py = [0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1];
//     const ny = [0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0];
//     const nz = [0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0];
//     const pz = [0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1];

//     function add(tile: number[], x: number, y: number, z: number, r: number, g: number, b: number) {
//       x -= size.x / 2;
//       y -= size.z / 2;
//       z += size.y / 2;

//       for (let i = 0; i < 18; i += 3) {
//         vertices.push(tile[i + 0] + x, tile[i + 1] + y, tile[i + 2] + z);
//         colors.push(r, g, b);
//       }
//     }

//     // Store data in a volume for sampling
//     const offsety = size.x;
//     const offsetz = size.x * size.y;
//     const array = new Uint8Array(size.x * size.y * size.z);
//     for (let j = 0; j < data.length; j += 4) {
//       const x = data[j + 0];
//       const y = data[j + 1];
//       const z = data[j + 2];

//       const index = x + y * offsety + z * offsetz;

//       array[index] = 255;
//     }

//     // Construct geometry
//     let hasColors = false;
//     for (let j = 0; j < data.length; j += 4) {
//       const x = data[j + 0];
//       const y = data[j + 1];
//       const z = data[j + 2];
//       const c = data[j + 3];

//       const hex = palette[c];
//       const r = ((hex >> 0) & 0xff) / 0xff;
//       const g = ((hex >> 8) & 0xff) / 0xff;
//       const b = ((hex >> 16) & 0xff) / 0xff;

//       if (r > 0 || g > 0 || b > 0) hasColors = true;

//       const index = x + y * offsety + z * offsetz;

//       if (array[index + 1] === 0 || x === size.x - 1) add(px, x, z, -y, r, g, b);
//       if (array[index - 1] === 0 || x === 0) add(nx, x, z, -y, r, g, b);
//       if (array[index + offsety] === 0 || y === size.y - 1) add(ny, x, z, -y, r, g, b);
//       if (array[index - offsety] === 0 || y === 0) add(py, x, z, -y, r, g, b);
//       if (array[index + offsetz] === 0 || z === size.z - 1) add(pz, x, z, -y, r, g, b);
//       if (array[index - offsetz] === 0 || z === 0) add(nz, x, z, -y, r, g, b);
//     }

//     const geometry = new BufferGeometry();
//     geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));
//     geometry.computeVertexNormals();

//     const material = new MeshStandardMaterial();
//     if (hasColors) {
//       geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
//       material.vertexColors = true;
//     }

//     super(geometry, material);
//   }
// }
