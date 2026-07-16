import { DAISIES } from "../config/daisies.js";
import { PARKS } from "../config/parks.js";
import { GAME } from "../config/game.js";
import { InputSystem } from "../systems/InputSystem.js";
import { ParallaxSystem } from "../systems/ParallaxSystem.js";
import { BallPhysicsSystem } from "../systems/BallPhysicsSystem.js";
import { DaisyController } from "../systems/DaisyController.js";
import { ThrowSystem } from "../systems/ThrowSystem.js";
import { CameraSystem } from "../systems/CameraSystem.js";
import { ScoreSystem } from "../systems/ScoreSystem.js";
import { submitScore } from "../data/api.js";

export class PlayScene extends Phaser.Scene {
  constructor() {
    super("PlayScene");
  }

  init(data) {
    this.dataFromMenu = data;
  }

  create() {
    this.park = PARKS.find((park) => park.id === this.dataFromMenu.parkId) || PARKS[0];
    this.variant = DAISIES.find((daisy) => daisy.id === this.dataFromMenu.daisyId) || DAISIES[0];
    this.physics.world.setBounds(0, 0, GAME.world.width, GAME.world.height);

    this.parallax = new ParallaxSystem(this, this.park, GAME.world);
    this.balls = this.physics.add.group();
    this.ballSystem = new BallPhysicsSystem(this, this.balls);
    this.daisy = new DaisyController(this, this.variant);
    this.inputSystem = new InputSystem();
    this.inputSystem.attach(this);
    this.cameraSystem = new CameraSystem(this, this.daisy.sprite);
    this.throwSystem = new ThrowSystem(this, this.ballSystem);
    this.scoreSystem = new ScoreSystem();
    this.roundMs = GAME.levels.roundSeconds * 1000;
    this.startedAt = this.time.now;
    this.throwSystem.reset(this.time.now);

    this.createLighting();
    document.querySelector("#hud").classList.add("is-active");
    this.updateHud();
  }

  createLighting() {
    const haze = this.add.rectangle(0, 0, GAME.world.width, GAME.world.height, this.park.ambientTint, 0.14).setOrigin(0, 0).setDepth(80);
    haze.setBlendMode(Phaser.BlendModes.SCREEN);
    const sun = this.add.ellipse(320, 120, 380, 180, 0xffe5aa, 0.18).setDepth(-10).setScrollFactor(0.05);
    sun.setBlendMode(Phaser.BlendModes.SCREEN);
  }

  update(time, delta) {
    const remaining = Math.max(0, this.roundMs - (time - this.startedAt));
    if (remaining <= 0) {
      this.endRound();
      return;
    }

    const input = this.inputSystem.getVector();
    this.daisy.update(input, delta);
    this.ballSystem.update(delta, this.park);
    this.throwSystem.update(time, this.balls.countActive(true), this.scoreSystem.level);

    this.balls.getChildren().forEach((ball) => {
      if (this.daisy.tryCatch(ball)) this.scoreSystem.catch();
    });

    this.cameraSystem.update(delta);
    this.parallax.update(this.cameras.main);
    this.updateHud(remaining);
  }

  updateHud(remaining = this.roundMs) {
    document.querySelector("#hud-score").textContent = this.scoreSystem.score;
    document.querySelector("#hud-streak").textContent = this.scoreSystem.streak;
    document.querySelector("#hud-time").textContent = Math.ceil(remaining / 1000);
    document.querySelector("#hud-stamina").value = this.daisy.stamina;
  }

  endRound() {
    const payload = {
      player: this.dataFromMenu.player,
      daisyId: this.variant.id,
      parkId: this.park.id,
      score: this.scoreSystem.score,
      bestStreak: this.scoreSystem.bestStreak,
      endedAt: new Date().toISOString()
    };
    submitScore(payload);
    document.querySelector("#hud").classList.remove("is-active");
    this.scene.start("ScoreScene", payload);
  }
}
