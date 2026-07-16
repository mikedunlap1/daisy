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
    const view = this.scene.cameras.main.worldView;
    const x = side === "left" ? view.left + 44 : view.right - 44;
    const daisy = this.scene.daisy?.sprite;
    const y = Phaser.Math.Clamp((daisy?.y ?? GAME.world.groundY + 70) + Phaser.Math.Between(-90, 80), GAME.world.floorMinY, GAME.world.floorMaxY - 35);
    const speedGrow = Math.min(1.45, Math.pow(GAME.levels.launchSpeedGrowth, level - 1));
    const targetX = Phaser.Math.Clamp((daisy?.x ?? view.centerX) + Phaser.Math.Between(-140, 180), view.left + 90, view.right - 90);
    const travelSeconds = Phaser.Math.Clamp(Math.abs(targetX - x) / Phaser.Math.Between(360, 520), 0.9, 1.8);
    const vx = ((targetX - x) / travelSeconds) * speedGrow;
    const vy = Phaser.Math.Between(GAME.ball.minLaunchVelocityY, GAME.ball.maxLaunchVelocityY);

    this.showChuckit(side, y);
    const ball = this.ballSystem.launch({ x, y, vx, vy, level });
    ball.setAlpha(0);
    this.scene.tweens.add({ targets: ball, alpha: 1, duration: 120, ease: "Linear" });
  }

  showChuckit(side, y) {
    const camera = this.scene.cameras.main;
    const view = camera.worldView;
    this.chuckit.setAlpha(1);
    this.chuckit.setFlipX(side === "right");
    this.chuckit.x = side === "left" ? view.left + 34 : view.right - 34;
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
