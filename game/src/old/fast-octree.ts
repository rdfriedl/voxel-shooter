import { Address } from "./octree";

type LodMethod = (values: number[]) => number;

const defaultLod: LodMethod = (v) => (v[0] + v[1] + v[2] + v[3] + v[4] + v[5] + v[6] + v[7]) / 8;

type Data = (Data | number)[];

export class FastOctree {
  data: Data = [];
  lod: number[];
  lodMethod: LodMethod;

  constructor(lodMethod: LodMethod = defaultLod, fill: number = 0) {
    this.data = [fill, fill, fill, fill, fill, fill, fill, fill];
    this.lod = [];
    this.lodMethod = lodMethod;
  }

  get(address: Address) {
    let node = this.data;
    for (let i = 0; i < address.length; i++) {
      const d = node[address.get(i)];
      if (typeof d === "number") return d;
      else if (d) node = d;
      else break;
      // if(d instanceof Array) node = d
      // else if (d) return d;
      // else break;
    }
    // if the address ended on a node. return the computed lod instead
    if (typeof node !== "number") {
      return this.lod[address.value];
    } else return node;
  }
  set(address: Address, value: number) {
    let node = this.data;
    for (let i = 0; i < address.length; i++) {
      const index = address.get(i);
      const d = node[index];
      if (i === address.length - 1) {
        node[index] = value;
      }
      // else if (d instanceof Array) {
      //   node = d;
      // }
      // else {
      //   const newNode: Data = [d, d, d, d, d, d, d, d];
      //   node[index] = newNode;
      //   node = newNode;
      // }
      else if (typeof d === "number") {
        const newNode: Data = [d, d, d, d, d, d, d, d];
        node[index] = newNode;
        node = newNode;
      } else node = d;
    }
  }

  getLod(address: Address) {
    return this.lod[address.value];
  }

  update() {
    const recurse = (node: Data, address: Address) => {
      const data: number[] = node.map((child, index) => {
        if (typeof child === "number") {
          return child;
        } else {
          const childAddress = address.clone();
          childAddress.push(index);
          return recurse(child, childAddress);
        }
        // if (child instanceof Array) {
        //   const childAddress = address.clone();
        //   childAddress.push(index);
        //   return recurse(child, childAddress);
        // }
        // else {
        //   return child;
        // }
      });

      const value = this.lodMethod(data);
      this.lod[address.value] = value;
      return value;
    };

    recurse(this.data, new Address());
  }
}
