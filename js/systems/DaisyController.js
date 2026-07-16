import { GAME } from "../config/game.js";

export class DaisyController {
  constructor(scene, variant) {
    this.scene = scene;
    this.variant = variant;
    this.stamina = 1;
    this.stopTimer = 0;
    this.carrying = false;
    this.sprite = scene.physics.add.sprite(460, GAME.world.groundY + 68, "daisy", "idle_0.png");
    this.sprite.setDepth(20);
    this.sprite.setDisplaySize(GAME.render.daisyWidth, GAME.render.daisyHeight);
    this.sprite.body.setSize(76, 58).setOffset(42, 58);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.play(variant.idleAnimation || "idle");
  }

  update(input, delta) {
    const dt = delta / 1000;
    const moving = input.lengthSq() > 0.01;
    const stats = this.variant.stats;

    if (this.variant.behavior?.randomStops && moving && this.stopTimer <= 0 && Math.random() < GAME.daisy.tiredStopChancePerSecond * dt) {
      this.stopTimer = GAME.daisy.tiredStopSeconds;
      this.sprite.play("tired-flop", true);
    }

    if (this.stopTimer > 0) {
      this.stopTimer -= dt;
      this.sprite.setVelocity(this.sprite.body.velocity.x * 0.86, this.sprite.body.velocity.y * 0.86);
      return;
    }

    const staminaSpeed = Phaser.Math.Linear(GAME.daisy.lowStaminaSpeed, 1, this.stamina);
    const speed = GAME.daisy.baseSpeed * stats.speed * staminaSpeed;
    const accel = GAME.daisy.baseAcceleration * stats.acceleration * Phaser.Math.Linear(0.82, 1.18, stats.turnRadius);

    if (moving) {
      this.sprite.setAcceleration(input.x * accel, input.y * accel);
      this.sprite.body.velocity.limit(speed);
      const drain = this.sprite.body.speed > GAME.daisy.sprintThreshold ? GAME.daisy.staminaDrainSprint : GAME.daisy.staminaDrainMove;
      this.stamina = Math.max(0, this.stamina - drain * (1 / stats.stamina) * dt);
    } else {
      this.sprite.setAcceleration(0, 0);
      this.sprite.setVelocity(this.sprite.body.velocity.x * GAME.daisy.idleDrag, this.sprite.body.velocity.y * GAME.daisy.idleDrag);
      this.stamina = Math.min(1, this.stamina + GAME.daisy.staminaRecovery * stats.stamina * dt);
    }

    const turnDrag = Phaser.Math.Linear(GAME.daisy.turnDrag - 0.035, GAME.daisy.turnDrag + 0.035, stats.turnRadius);
    this.sprite.setVelocity(this.sprite.body.velocity.x * turnDrag, this.sprite.body.velocity.y * turnDrag);
    this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 70, GAME.world.width - 70);
    this.sprite.y = Phaser.Math.Clamp(this.sprite.y, GAME.world.floorMinY, GAME.world.floorMaxY);
    this.sprite.setFlipX(this.sprite.body.velocity.x < -8);
    this.sprite.setDepth(20 + Math.floor(this.sprite.y / 12));
    this.playMotionAnimation(moving);
  }

  playMotionAnimation(moving) {
    if (this.carrying) {
      this.sprite.play("return", true);
      return;
    }
    if (!moving && this.sprite.body.speed < 35) {
      this.sprite.play(this.variant.idleAnimation || "idle", true);
    } else if (this.sprite.body.speed > GAME.daisy.sprintThreshold) {
      this.sprite.play("sprint", true);
    } else if (this.sprite.body.speed > 120) {
      this.sprite.play("run", true);
    } else {
      this.sprite.play("walk", true);
    }
  }

  tryCatch(ball) {
    if (!ball.active || ball.data.caught) return false;
    const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, ball.x, ball.y);
    const airborneBonus = Math.abs(ball.data.height) < 155 ? 12 : 0;
    const focusBonus = Phaser.Math.Linear(-8, 12, this.variant.stats.focus);
    if (distance < GAME.daisy.catchRadius + airborneBonus + focusBonus) {
      ball.data.caught = true;
      ball.data.shadow.destroy();
      ball.destroy();
      this.sprite.play("pounce", true);
      this.scene.time.delayedCall(GAME.daisy.catchAnimationMs, () => this.sprite.play("return", true));
      return true;
    }
    return false;
  }
}
