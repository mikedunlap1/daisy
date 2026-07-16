import { GAME } from "../config/game.js";

export class DaisyController {
  constructor(scene, variant) {
    this.scene = scene;
    this.variant = variant;
    this.stamina = 1;
    this.stopTimer = 0;
    this.carrying = false;
    this.shadow = scene.add.ellipse(460, GAME.world.groundY + 126, 156, 34, 0x102416, 0.28).setDepth(18);
    this.sprite = scene.physics.add.sprite(460, GAME.world.groundY + 64, "daisy", 0);
    this.sprite.setDepth(20);
    this.sprite.setDisplaySize(GAME.render.daisyWidth, GAME.render.daisyHeight);
    this.sprite.body.setSize(104, 82).setOffset(44, 92);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setMaxVelocity(GAME.daisy.baseSpeed * 1.4);
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
      this.updateShadow();
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
    this.updateShadow();
    this.playMotionAnimation(moving);
  }

  updateShadow() {
    this.shadow.x = this.sprite.x - (this.sprite.flipX ? -12 : 12);
    this.shadow.y = this.sprite.y + 76;
    this.shadow.setDepth(this.sprite.depth - 1);
    this.shadow.scaleX = Phaser.Math.Clamp(0.9 + this.sprite.body.speed / 900, 0.9, 1.22);
    this.shadow.alpha = Phaser.Math.Clamp(0.22 + this.sprite.body.speed / 2200, 0.22, 0.34);
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
    const groundY = ball.data.baseY ?? ball.y;
    const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y + 20, ball.x, groundY);
    const catchableHeight = ball.data.height > -185;
    const airborneBonus = catchableHeight ? 28 : -30;
    const focusBonus = Phaser.Math.Linear(-8, 12, this.variant.stats.focus);
    if (distance < GAME.daisy.catchRadius + airborneBonus + focusBonus) {
      ball.data.caught = true;
      ball.data.shadow.destroy();
      ball.destroy();
      this.scene.showCatchFeedback?.(ball.x, groundY);
      this.sprite.play("pounce", true);
      this.scene.time.delayedCall(GAME.daisy.catchAnimationMs, () => this.sprite.play("return", true));
      return true;
    }
    return false;
  }
}
