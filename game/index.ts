import * as THREE from "three";

import { connect } from "./connection";

await connect();
import "./scene";

if (import.meta.env.DEV) {
  window.THREE = THREE;
}
