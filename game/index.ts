// import { connect } from "./connection";

// connect().then(() => {
import("./scene");
// });

import * as THREE from "three";
if (import.meta.env.DEV) {
  window.THREE = THREE;
}
