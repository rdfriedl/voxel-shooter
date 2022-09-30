import fs from "fs";
import path from "path";
import { Client, Delayed, Room } from "colyseus";
import { Vector3 } from "three";
import { Player, State } from "../../common/schema";
import { readVoxChunksIntoWorld, readVoxModelChunks } from "../../common/utils/vox-loader";
import { VoxelWorld } from "../../common/voxel";
import { BulletManager } from "../../common/bullets/core";

export class GameRoom extends Room<State> {
  // number of clients per room
  maxClients = 20;

  timer: Delayed | undefined;
  voxelWorld: VoxelWorld = new VoxelWorld(16, new Vector3(32, 32, 32));
  bulletManager: BulletManager = new BulletManager(this.voxelWorld);

  // room has been created: bring your own logic
  async onCreate(options) {
    console.log("Room created!", options);

    this.setState(new State());

    this.onMessage("position", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.position.x = message.position.x;
        player.position.y = message.position.y;
        player.position.z = message.position.z;
        player.velocity.x = message.velocity.x;
        player.velocity.y = message.velocity.y;
        player.velocity.z = message.velocity.z;
      } else {
        console.log("missing player for " + client.sessionId);
      }
    });

    this.onMessage("shoot", this.handleShoot.bind(this));

    this.timer = this.clock.setInterval(this.execute.bind(this), 1000 / 60);

    this.loadLevel();
  }

  loadLevel() {
    const voxFile = fs.readFileSync(path.join(__dirname, "../maps/level.vox"));
    const array = new ArrayBuffer(voxFile.length);
    const typedArray = new Uint8Array(array);
    for (let i = 0; i < voxFile.length; i++) {
      typedArray[i] = voxFile[i];
    }
    const chunks = readVoxModelChunks(array);
    this.state.world.size.copy(this.voxelWorld.size);
    readVoxChunksIntoWorld(chunks, this.voxelWorld);
    this.voxelWorld.palette.forEach((c, i) => (this.state.world.palette[i] = c));
  }

  handleShoot(client: Client, message: { position: number[]; direction: number[] }) {
    const player = this.state.players.get(client.sessionId);
    if (!player) return;

    const p = new Vector3().fromArray(message.position);
    const d = new Vector3().fromArray(message.direction);
    this.bulletManager.createBullet(p, d);

    // for (const other of this.clients) {
    // other.send("new-bullet", message);
    // }
  }

  execute() {
    // update bullets
    this.bulletManager.update(this.clock.deltaTime);

    // update chunks
    for (const [v, chunk] of this.voxelWorld) {
      if (chunk.dirty) {
        const key = v.toArray().join("-");
        this.state.world.chunks.set(key, chunk.encode());
        chunk.dirty = false;
      }
    }
  }

  onAuth(client, options, req) {
    return true;
  }

  async onJoin(client: Client) {
    console.log("creating player for", client.sessionId);
    const player = new Player();
    player.id = client.sessionId;
    this.state.players.set(client.sessionId, player);

    client.send("hello", `hello ${client.sessionId}`);
  }

  async onLeave(client: Client) {
    console.log(`player ${client.sessionId} left`);
    this.state.players.delete(client.sessionId);
  }

  async onDispose() {
    this.timer?.clear();
  }
}