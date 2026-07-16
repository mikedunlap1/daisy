import { GAME } from "../config/game.js";

export class CameraSystem {
  constructor(scene, target) {
    this.scene = scene;
    this.target = target;
    scene.cameras.main.setBounds(0, 0, GAME.world.width, GAME.world.height);
    scene.cameras.main.setZoom(GAME.camera.zoomNormal);
  }

  update(delta) {
    const camera = this.scene.cameras.main;
    const vx = this.target.body.velocity.x;
    const lead = Phaser.Math.Clamp(vx / 320, -1, 1) * GAME.camera.leadX;
    const targetX = this.target.x + lead - camera.width / 2;
    const targetY = this.target.y + GAME.camera.leadY - camera.height / 2;
    camera.scrollX = Phaser.Math.Linear(camera.scrollX, targetX, GAME.camera.lerp);
    camera.scrollY = Phaser.Math.Linear(camera.scrollY, targetY, GAME.camera.lerp);
    const desiredZoom = this.target.body.speed > GAME.daisy.sprintThreshold ? GAME.camera.zoomFast : GAME.camera.zoomNormal;
    camera.zoom = Phaser.Math.Linear(camera.zoom, desiredZoom, 0.025);
  }
}
