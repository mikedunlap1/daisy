import { GAME } from "../config/game.js";

export class ThrowSystem {
  constructor(scene, ballSystem) {
    this.scene = scene;
    this.ballSystem = ballSystem;
    this.nextThrowAt = 0;
    this.chuckit = scene.add.image(-80, GAME.world.groundY - 180, "chuckit").setDepth(50).setScale(0.74).setAlpha(0);
  }

  reset(now) {
    this.nextThrowAt = now + GAME.throws.firstDelay;
  }

  update(now, activeCount, level) {
    if (now < this.nextThrowAt || activeCount >= GAME.throws.maxActiveBalls) return;
    this.throwBall(level);
    this.nextThrowAt = now + GAME.throws.waveDelay / Math.min(1.45, 1 + level * 0.045);
  }

  throwBall(level) {
    const side = Math.random() > 0.5 ? "left" : "right";
    const x = side === "left" ? this.scene.cameras.main.scrollX - 60 : this.scene.cameras.main.scrollX + this.scene.scale.width + 60;
    const daisy = this.scene.daisy?.sprite;
    const y = Phaser.Math.Clamp((daisy?.y ?? GAME.world.groundY + 70) + Phaser.Math.Between(-90, 80), GAME.world.floorMinY, GAME.world.floorMaxY - 35);
    const direction = side === "left" ? 1 : -1;
    const speedGrow = Math.min(1.45, Math.pow(GAME.levels.launchSpeedGrowth, level - 1));
    const targetX = Phaser.Math.Clamp((daisy?.x ?? GAME.world.width * 0.5) + Phaser.Math.Between(-180, 220), 180, GAME.world.width - 180);
    const travelSeconds = Phaser.Math.Clamp(Math.abs(targetX - x) / Phaser.Math.Between(470, 650), 1.05, 2.2);
    const vx = ((targetX - x) / travelSeconds) * speedGrow;
    const vy = Phaser.Math.Between(GAME.ball.minLaunchVelocityY, GAME.ball.maxLaunchVelocityY);

    this.showChuckit(side, y);
    this.ballSystem.launch({ x, y, vx, vy, level });
  }

  showChuckit(side, y) {
    const camera = this.scene.cameras.main;
    this.chuckit.setAlpha(1);
    this.chuckit.setFlipX(side === "right");
    this.chuckit.x = side === "left" ? camera.scrollX + 20 : camera.scrollX + camera.width - 20;
    this.chuckit.y = y - 130;
    this.chuckit.rotation = side === "left" ? -0.9 : 0.9;
    this.scene.tweens.add({
      targets: this.chuckit,
      rotation: side === "left" ? 0.35 : -0.35,
      alpha: 0,
      duration: GAME.throws.chuckitVisibleMs,
      ease: "Cubic.easeOut"
    });
  }
}
