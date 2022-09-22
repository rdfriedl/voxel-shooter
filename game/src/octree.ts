type LodMethod = (values: number[]) => number;

const defaultLod: LodMethod = (v) => (v[0] + v[1] + v[2] + v[3] + v[4] + v[5] + v[6] + v[7]) / 8;

export class Octree {
  data: (Octree | number)[] = [];
  parent?: Octree;
  lodMethod: LodMethod;
  lodValue: number;
  dirty = true;

  constructor(lod: LodMethod = defaultLod, fill: number = 0, parent?: Octree) {
    this.parent = parent;
    this.lodMethod = lod;

    this.lodValue = fill;
    this.data = [fill, fill, fill, fill, fill, fill, fill, fill];
  }

  getIndex(index: number) {
    return this.data[index];
  }
  setData(index: number, value: number, makeDirty = true) {
    this.data[index] = value;
    if (makeDirty) this.setDirty();
  }
  createBranch(index: number, makeDirty = true) {
    let value = this.data[index];
    if (typeof value === "number") {
      const child = (this.data[index] = new Octree(this.lodMethod, value, this));
      if (makeDirty) this.setDirty();
      return child;
    }

    return value;
  }

  setDirty() {
    this.dirty = true;
    this.parent?.setDirty();
  }
  update(force = false): number {
    if (!this.dirty && !force) return this.lodValue;
    const values = [];
    for (let i = 0; i < 8; i++) {
      const data = this.data[i];
      values[i] = typeof data === "number" ? data : data.update(force);
    }
    this.lodValue = this.lodMethod(values);
    this.dirty = false;
    return this.lodValue;
  }

  set(address: Address, value: number, makeDirty = false, addrIndex = 0) {
    const index = address.get(addrIndex);
    if (addrIndex === address.length - 1) {
      this.setData(index, value, makeDirty);
    } else {
      let data = this.data[index];
      if (typeof data === "number") {
        data = this.createBranch(index, makeDirty);
      }
      data.set(address, value, makeDirty, addrIndex + 1);
    }
  }
  get(address: Address, addrIndex = 0): number {
    const index = address.get(addrIndex);
    const data = this.data[index];
    if (typeof data !== "number") {
      if (addrIndex === address.length - 1) {
        return data.lodValue;
      } else {
        return data.get(address, addrIndex + 1);
      }
    } else {
      return this.data[index] as number;
    }
  }

  *[Symbol.iterator]() {
    for (let i = 0; i < 8; i++) {
      yield this.getIndex(i);
    }
  }
}

export class Address {
  length = 0;
  value = 0;

  get(i: number) {
    return 7 & (this.value >> (i * 3));
  }
  pop() {
    const v = this.get(0);
    this.value = this.value >> 3;
    this.length--;
    return v;
  }
  push(value: number) {
    const v = 7 & value;
    this.value = v | (this.value << 3);
    this.length++;
  }
  clone() {
    const address = new Address();
    address.value = this.value;
    address.length = this.length;
    return address;
  }
}

export function encode(tree: Octree) {
  // let map = 0;
  // const TypedArray = tree.typedArray;
  // const data = new TypedArray();
  // for (let i = 0; i < 8; i++) {
  //   const branch = tree.data;
  //   if (typeof branch === "number") {
  //     if (branch > 0) {
  //       map |= 1 << i;
  //     }
  //   } else {
  //     map |= 1 << i;
  //   }
  // }
}

// const COMMANDS = { DATA: 1, DOWN: 0 };
// export function encodeOctree(tree: Octree): ArrayBuffer {
//   const commands: number[] = [];
//   const data: number[] = [];

//   const recurse = (node: Octree) => {
//     for (const cell of node.branches) {
//       if (typeof cell === "number") {
//         commands.push(COMMANDS.DATA);
//         data.push(cell);
//       } else {
//         commands.push(COMMANDS.DOWN);
//         recurse(cell);
//       }
//     }
//   };

//   recurse(tree);

//   const buffer = new ArrayBuffer(Math.ceil((commands.length + data.length * tree.bitLength) / 8));
//   const view = new DataView(buffer);

//   let offset = 0;
//   let chunkIndex = 0;
//   let chunkByte = 0;
//   const appendBits = (bits: number, length: number) => {
//     for (let i = 0; i < length; i++) {
//       const v = 1 & (bits >> i);
//       chunkByte |= v << chunkIndex;
//       chunkIndex++;
//       if (chunkIndex === 8) {
//         view.setUint8(offset, chunkByte);
//         offset++;
//         chunkIndex = 0;
//         chunkByte = 0;
//       }
//     }
//     view.setUint8(offset, chunkByte);
//   };

//   while (commands.length) {
//     const cmd = commands.shift();
//     if (cmd === COMMANDS.DATA) {
//       const value = data.shift();
//       if (value === undefined) throw new Error("data missing for command");
//       appendBits(cmd, 1);
//       appendBits(value, tree.bitLength);
//     } else if (cmd === COMMANDS.DOWN) {
//       appendBits(cmd, 1);
//     }
//   }

//   if (data.length > 0) throw new Error("failed to encode all data");

//   return buffer;
// }

// export function decodeOctree(buffer: ArrayBuffer, bitLength: number): Octree {
//   const tree = new Octree(bitLength);
//   const view = new DataView(buffer);

//   let offset = 0;
//   let chunkIndex = 0;
//   const readBits = (length: number) => {
//     let value = 0;
//     for (let i = 0; i < length; i++) {
//       const chunk = view.getUint8(offset);
//       value |= (1 & (chunk >> chunkIndex)) << i;
//       chunkIndex++;

//       if (chunkIndex === 8) {
//         offset++;
//         chunkIndex = 0;
//       }
//     }

//     return value;
//   };

//   const recurse = (node: Octree) => {
//     for (let cellIndex = 0; cellIndex < 8; cellIndex++) {
//       const cmd = readBits(1);
//       if (cmd === COMMANDS.DATA) {
//         const data = readBits(bitLength);
//         node.setBranch(cellIndex, data);
//       } else if (cmd === COMMANDS.DOWN) {
//         node.createBranch(cellIndex);
//         recurse(node.getBranch(cellIndex) as Octree);
//       } else throw Error("unknown command");
//     }
//   };

//   recurse(tree);

//   // if (offset !== buffer.byteLength) {
//   //   console.log(offset, chunkIndex);

//   //   throw new Error("failed to read all buffer data");
//   // }

//   tree.update();

//   return tree;
// }
