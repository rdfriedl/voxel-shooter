// import md5 from "md5";

type LodMethod = (values: number[]) => number;

const defaultLod: LodMethod = (v) =>
  (v[0] + v[1] + v[2] + v[3] + v[4] + v[5] + v[6] + v[7]) / 8;

export class Octree {
  bitLength = 0;
  branches: (Octree | number)[] = [];
  parent?: Octree;
  // hash: string = "";
  lodMethod: LodMethod;
  lodValue: number;
  dirty = true;
  isTree = true;

  constructor(
    bitLength: number,
    lod: LodMethod = defaultLod,
    fill: number = 0,
    parent?: Octree
  ) {
    this.bitLength = bitLength;
    this.parent = parent;
    this.lodMethod = lod;

    this.lodValue = fill;
    this.branches = [fill, fill, fill, fill, fill, fill, fill, fill];
  }

  getBranch(index: number) {
    return this.branches[index];
  }
  setBranch(index: number, value: number, makeDirty = true) {
    this.branches[index] = value;
    if (makeDirty) this.setDirty();
  }
  splitBranch(index: number, makeDirty = true) {
    let value = this.branches[index];
    if (typeof value === "number") {
      value = this.branches[index] = new Octree(
        this.bitLength,
        this.lodMethod,
        value,
        this
      );
    }

    if (makeDirty) this.setDirty();

    return value;
  }

  setDirty() {
    this.dirty = true;
    this.parent?.setDirty();
  }
  update(force = false): number {
    if (!this.dirty && !force) return this.lodValue;
    const values = this.branches.map((cell) => {
      if (typeof cell === "number") return cell;
      else return cell.update(force);
    });
    this.lodValue = this.lodMethod(values);
    // this.hash = md5(values);
    this.dirty = false;
    return this.lodValue;
  }

  recursiveSetValue(
    address: Address,
    value: number,
    makeDirty = false,
    addrIndex = 0
  ) {
    const index = address.get(addrIndex);
    if (addrIndex === address.length - 1) {
      this.setBranch(index, value, makeDirty);
    } else {
      let branch = this.getBranch(index);
      if (typeof branch === "number") {
        branch = this.splitBranch(index, makeDirty);
      }
      branch.recursiveSetValue(address, value, makeDirty, addrIndex + 1);
    }
  }
  recursiveGetValue(address: Address, addrIndex = 0): number {
    const index = address.get(addrIndex);
    if (addrIndex === address.length - 1) {
      const branch = this.getBranch(index);
      return branch instanceof Octree ? branch.lodValue : branch;
    } else {
      let branch = this.getBranch(index);
      if (typeof branch === "number") {
        return branch;
      }
      return branch.recursiveGetValue(address, addrIndex + 1);
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

const COMMANDS = { DATA: 1, DOWN: 0 };
export function encodeOctree(tree: Octree): ArrayBuffer {
  const commands: number[] = [];
  const data: number[] = [];

  const recurse = (node: Octree) => {
    for (const cell of node.branches) {
      if (typeof cell === "number") {
        commands.push(COMMANDS.DATA);
        data.push(cell);
      } else {
        commands.push(COMMANDS.DOWN);
        recurse(cell);
      }
    }
  };

  recurse(tree);

  const buffer = new ArrayBuffer(
    Math.ceil((commands.length + data.length * tree.bitLength) / 8)
  );
  const view = new DataView(buffer);

  let offset = 0;
  let chunkIndex = 0;
  let chunkByte = 0;
  const appendBits = (bits: number, length: number) => {
    for (let i = 0; i < length; i++) {
      const v = 1 & (bits >> i);
      chunkByte |= v << chunkIndex;
      chunkIndex++;
      if (chunkIndex === 8) {
        view.setUint8(offset, chunkByte);
        offset++;
        chunkIndex = 0;
        chunkByte = 0;
      }
    }
    view.setUint8(offset, chunkByte);
  };

  while (commands.length) {
    const cmd = commands.shift();
    if (cmd === COMMANDS.DATA) {
      const value = data.shift();
      if (value === undefined) throw new Error("data missing for command");
      appendBits(cmd, 1);
      appendBits(value, tree.bitLength);
    } else if (cmd === COMMANDS.DOWN) {
      appendBits(cmd, 1);
    }
  }

  if (data.length > 0) throw new Error("failed to encode all data");

  return buffer;
}

export function decodeOctree(buffer: ArrayBuffer, bitLength: number): Octree {
  const tree = new Octree(bitLength);
  const view = new DataView(buffer);

  let offset = 0;
  let chunkIndex = 0;
  const readBits = (length: number) => {
    let value = 0;
    for (let i = 0; i < length; i++) {
      const chunk = view.getUint8(offset);
      value |= (1 & (chunk >> chunkIndex)) << i;
      chunkIndex++;

      if (chunkIndex === 8) {
        offset++;
        chunkIndex = 0;
      }
    }

    return value;
  };

  const recurse = (node: Octree) => {
    for (let cellIndex = 0; cellIndex < 8; cellIndex++) {
      const cmd = readBits(1);
      if (cmd === COMMANDS.DATA) {
        const data = readBits(bitLength);
        node.setBranch(cellIndex, data);
      } else if (cmd === COMMANDS.DOWN) {
        node.splitBranch(cellIndex);
        recurse(node.getBranch(cellIndex) as Octree);
      } else throw Error("unknown command");
    }
  };

  recurse(tree);

  // if (offset !== buffer.byteLength) {
  //   console.log(offset, chunkIndex);

  //   throw new Error("failed to read all buffer data");
  // }

  tree.update();

  return tree;
}
