import { GAME } from "../config/game.js";

export class DaisyController {
  constructor(scene, variant) {
    this.scene = scene;
    this.variant = variant;
    this.stamina = 1;
    this.stopTimer = 0;
    this.carrying = false;
    this.carriedBall = null;
    this.jumpHeight = 0;
    this.jumpVelocity = 0;
    this.actionState = null;
    this.actionUntil = 0;
    this.direction = "se";
    this.directionAngle = Math.PI / 4;
    this.motionState = "idle";
    this.shadow = scene.add.ellipse(460, GAME.world.groundY + 104, 82, 19, 0x102416, 0.28).setDepth(18);
    this.sprite = scene.physics.add.sprite(460, GAME.world.groundY + 68, "daisy", "run-se-0.png");
    this.sprite.setDepth(20);
    this.sprite.setDisplaySize(GAME.render.daisyWidth, GAME.render.daisyHeight);
    this.sprite.body.setSize(82, 52).setOffset(54, 120);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setMaxVelocity(GAME.daisy.baseSpeed * 1.4);
    this.sprite.setOrigin(0.5, 192 / 208);
  }

  update(input, delta, jumpPressed = false) {
    const dt = delta / 1000;
    this.sprite.y += this.jumpHeight;
    if (jumpPressed && this.jumpHeight === 0) {
      this.jumpVelocity = GAME.daisy.jumpVelocity;
      this.setActionState("jump-pounce", 0);
    }
    const moving = input.lengthSq() > 0.01;
    const stats = this.variant.stats;

    if (this.variant.behavior?.randomStops && moving && this.stopTimer <= 0 && Math.random() < GAME.daisy.tiredStopChancePerSecond * dt) {
      this.stopTimer = GAME.daisy.tiredStopSeconds;
      this.setActionState("recovery", GAME.daisy.tiredStopSeconds * 1000);
    }

    if (this.stopTimer > 0) {
      this.stopTimer -= dt;
      this.sprite.setVelocity(this.sprite.body.velocity.x * 0.86, this.sprite.body.velocity.y * 0.86);
      this.updateJump(dt);
      this.sprite.y -= this.jumpHeight;
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
    this.updateJump(dt);
    this.sprite.y -= this.jumpHeight;
    this.sprite.setDepth(20 + Math.floor(this.sprite.y / 12));
    this.updateShadow();
    this.updateDirection(input, moving);
    this.playMotionAnimation(moving);
    this.updateCarriedBall();
  }

  updateJump(dt) {
    if (this.jumpVelocity === 0 && this.jumpHeight === 0) return;
    this.jumpHeight = Math.max(0, this.jumpHeight + this.jumpVelocity * dt);
    this.jumpVelocity -= GAME.daisy.jumpGravity * dt;
    if (this.jumpHeight === 0) {
      if (this.jumpVelocity !== 0) this.setActionState("landing-recovery", GAME.daisy.landingRecoveryMs);
      this.jumpVelocity = 0;
    }
  }

  updateDirection(input, moving) {
    const velocity = this.sprite.body.velocity;
    const vector = velocity.lengthSq() > 100 ? velocity : input;
    if (!moving || vector.lengthSq() < 0.01) return;
    const angle = Phaser.Math.Angle.Normalize(Math.atan2(vector.y, vector.x));
    const directions = ["e", "se", "s", "sw", "w", "nw", "n", "ne"];
    const candidate = directions[Math.round(angle / (Math.PI / 4)) % 8];
    if (candidate === this.direction) {
      this.directionAngle = angle;
      return;
    }
    const delta = Math.abs(Phaser.Math.Angle.Wrap(angle - this.directionAngle));
    if (delta >= Phaser.Math.DegToRad(GAME.daisy.directionHysteresisDegrees)) {
      this.direction = candidate;
      this.directionAngle = angle;
    }
  }

  updateShadow() {
    this.shadow.x = this.sprite.x;
    this.shadow.y = this.sprite.y + this.jumpHeight + 54;
    this.shadow.setDepth(this.sprite.depth - 1);
    this.shadow.scaleX = Phaser.Math.Clamp(0.9 + this.sprite.body.speed / 900, 0.9, 1.22);
    this.shadow.alpha = Phaser.Math.Clamp(0.22 + this.sprite.body.speed / 2200, 0.22, 0.34);
  }

  playMotionAnimation(moving) {
    if (this.actionState && this.actionUntil && this.scene.time.now >= this.actionUntil) this.actionState = null;
    const { authored, flip } = this.getAuthoredDirection();
    this.sprite.setFlipX(flip);
    this.sprite.setAngle(0);

    if (this.jumpHeight > 0 || this.actionState === "jump-pounce") {
      this.motionState = "jump-pounce";
      this.sprite.stop().setFrame(`run-${authored}-3.png`);
      return;
    }
    if (this.actionState === "ball-pickup") {
      this.motionState = "ball-pickup";
      this.sprite.stop().setFrame(`run-${authored}-2.png`);
      return;
    }
    if (this.actionState === "roll") {
      this.motionState = "roll";
      this.sprite.play(`daisy-sprint-${authored}`, true);
      this.sprite.setAngle(this.sprite.flipX ? -8 : 8);
      return;
    }
    if (this.actionState === "landing-recovery" || this.actionState === "recovery") {
      this.motionState = this.actionState;
      this.sprite.stop().setFrame(`run-${authored}-4.png`);
      return;
    }

    let locomotion = "walk";
    if (this.sprite.body.speed > GAME.daisy.sprintThreshold) locomotion = "sprint";
    else if (this.sprite.body.speed > GAME.daisy.runThreshold) locomotion = "run";
    if (!moving && this.sprite.body.speed < GAME.daisy.idleSpeedThreshold) {
      this.motionState = this.carrying ? "carry-return" : "idle";
      this.sprite.stop().setFrame(`run-${authored}-0.png`);
      return;
    }
    this.motionState = this.carrying ? "carry-return" : locomotion;
    this.sprite.play(`daisy-${locomotion}-${authored}`, true);
  }

  getAuthoredDirection() {
    const mirror = { w: "e", nw: "ne", sw: "se" };
    return { authored: mirror[this.direction] || this.direction, flip: Boolean(mirror[this.direction]) };
  }

  setActionState(state, durationMs = 0) {
    this.actionState = state;
    this.actionUntil = durationMs ? this.scene.time.now + durationMs : 0;
  }

  updateCarriedBall() {
    if (!this.carriedBall?.active) return;
    const horizontal = this.sprite.flipX ? -1 : 1;
    this.carriedBall.setPosition(this.sprite.x + horizontal * 31, this.sprite.y - 20);
    this.carriedBall.setDepth(this.sprite.depth + 1);
  }

  tryCatch(ball) {
    const data = ball.flightData;
    if (!ball.active || !data || data.caught) return false;
    const groundY = data.baseY ?? ball.y;
    const distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y + this.jumpHeight + 20, ball.x, groundY);
    const catchableHeight = data.height > -185;
    const airborneBonus = catchableHeight ? 28 : -30;
    const focusBonus = Phaser.Math.Linear(-8, 12, this.variant.stats.focus);
    if (distance < GAME.daisy.catchRadius + airborneBonus + focusBonus) {
      const catchX = ball.x;
      data.caught = true;
      data.shadow.destroy();
      ball.destroy();
      this.scene.showCatchFeedback?.(catchX, groundY);
      this.setActionState("ball-pickup", GAME.daisy.catchAnimationMs);
      this.scene.time.delayedCall(GAME.daisy.catchAnimationMs, () => {
        this.carrying = true;
        this.carriedBall?.destroy();
        this.carriedBall = this.scene.add.sprite(this.sprite.x, this.sprite.y, "tennis-ball").setDisplaySize(24, 24);
        this.setActionState("carry-return", GAME.daisy.returnAnimationMs);
        this.scene.time.delayedCall(GAME.daisy.returnAnimationMs, () => {
          this.carrying = false;
          this.carriedBall?.destroy();
          this.carriedBall = null;
          this.setActionState("landing-recovery", GAME.daisy.landingRecoveryMs);
        });
      });
      return true;
    }
    return false;
  }
}
