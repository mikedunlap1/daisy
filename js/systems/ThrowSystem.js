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
    const y = Phaser.Math.Between(GAME.world.floorMinY - 30, GAME.world.floorMaxY - 70);
    const direction = side === "left" ? 1 : -1;
    const speedGrow = Math.pow(GAME.levels.launchSpeedGrowth, level - 1);
    const vx = direction * Phaser.Math.Between(GAME.ball.minLaunchVelocityX, GAME.ball.maxLaunchVelocityX) * speedGrow;
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
