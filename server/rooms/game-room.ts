import fs from "fs";
import path from "path";
import { Client, Delayed, Presence, Room } from "colyseus";
import { Vector3 } from "three";
import { PlayerState, State, UserLnInfo } from "../../common/schema";
import { readVoxChunksIntoWorld, readVoxModelChunks } from "../../common/utils/vox-loader";
import { VoxelWorld } from "../../common/voxel";
import { BulletManager } from "../game/bullets/manager";
import { PlayerManager } from "../game/players/manager";

export class GameRoom extends Room<State> {
  // number of clients per room
  maxClients = 20;

  executeTimer: Delayed | undefined;
  incrementTime: Delayed | undefined;
  voxelWorld: VoxelWorld = new VoxelWorld(16, new Vector3(32, 32, 32));
  bulletManager: BulletManager;
  playerManager: PlayerManager;

  constructor(presence?: Presence) {
    super(presence);

    this.bulletManager = new BulletManager(this);
    this.playerManager = new PlayerManager(this);
  }

  // room has been created: bring your own logic
  async onCreate(options) {
    console.log("Room created!", options);

    this.setState(new State());
    this.playerManager.setup();

    this.onMessage("shoot", this.handleShoot.bind(this));

    this.bulletManager.onBulletCreate.addListener((bullet) => {
      this.broadcast("bullet-create", {
        id: bullet.id,
        position: bullet.position.toArray(),
        velocity: bullet.velocity.toArray(),
      });
    });
    this.bulletManager.onBulletDestroy.addListener((bullet) => {
      this.broadcast("bullet-destroy", bullet.id);
    });

    this.executeTimer = this.clock.setInterval(this.execute.bind(this), 1000 / 60);
    this.incrementTime = this.clock.setInterval(() => (this.state.time += 1), 1000);

    this.loadLevel();
  }

  loadLevel() {
    const voxFile = fs.readFileSync(path.join(process.cwd(), "maps/prototype.vox"));
    const array = new ArrayBuffer(voxFile.length);
    const typedArray = new Uint8Array(array);
    for (let i = 0; i < voxFile.length; i++) {
      typedArray[i] = voxFile[i];
    }
    const chunks = readVoxModelChunks(array);
    this.state.world.size.x = this.voxelWorld.size.x;
    this.state.world.size.y = this.voxelWorld.size.y;
    this.state.world.size.z = this.voxelWorld.size.z;
    readVoxChunksIntoWorld(chunks, this.voxelWorld);
    this.voxelWorld.palette.forEach((c, i) => (this.state.world.palette[i] = c));
  }

  handleShoot(client: Client, message: { position: number[]; direction: number[] }) {
    const player = this.playerManager.getPlayer(client.sessionId);
    if (!player) return;

    const position = new Vector3().fromArray(message.position);
    const direction = new Vector3().fromArray(message.direction).multiplyScalar(1000);

    this.bulletManager.createBullet(position, direction, player);
  }

  execute() {
    const delta = this.clock.deltaTime / 1000;
    // update bullets
    this.playerManager.update(delta);
    this.bulletManager.update(delta);

    // update chunks
    for (const [key, chunk] of this.voxelWorld) {
      if (chunk.dirty) {
        this.state.world.chunks.set(key, chunk.encode());
        chunk.dirty = false;
      }
    }
  }

  onAuth(client: Client, { userLnInfo }: { userLnInfo: UserLnInfo }, req) {
    client.userData = userLnInfo;
    return true;
  }

  async onJoin(client: Client) {
    // create player state
    const state = new PlayerState();
    state.id = client.sessionId;
    this.state.players.set(client.sessionId, state);
    // create player
    this.playerManager.createPlayer(state);

    client.send("hello", `hello ${client.sessionId}`);
  }

  async onLeave(client: Client) {
    console.log(`player ${client.sessionId} left`);
    this.state.players.delete(client.sessionId);
    this.playerManager.removePlayer(client.sessionId);
  }

  async onDispose() {
    this.executeTimer?.clear();
    this.incrementTime?.clear();
  }
}
