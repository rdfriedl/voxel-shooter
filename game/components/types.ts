import { createType } from "ecsy";
import { Mesh, Object3D, Vector3 } from "three";

export const VectorType = createType<Vector3, Vector3>({
  name: "Vector3",
  default: new Vector3(),
  copy: (src, dest) => dest.copy(src),
  clone: (v) => v.clone(),
});

export const Object3DType = createType<Object3D, Object3D>({
  name: "Object3D",
  default: new Object3D(),
  copy: (src, dest) => {
    if (src.constructor === dest.constructor) {
      return dest.copy(src);
    } else return src.clone();
  },
  clone: (v) => v.clone(),
});

export const MeshType = createType<Mesh, Mesh>({
  name: "Mesh",
  default: new Mesh(),
  copy: (src, dest) => dest.copy(src),
  clone: (v) => v.clone(),
});
