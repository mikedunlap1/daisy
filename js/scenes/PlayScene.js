import { DAISIES } from "../config/daisies.js";
import { PARKS } from "../config/parks.js";
import { GAME } from "../config/game.js";
import { InputSystem } from "../systems/InputSystem.js?v=20260718-2";
import { ParallaxSystem } from "../systems/ParallaxSystem.js?v=20260718-2";
import { BallPhysicsSystem } from "../systems/BallPhysicsSystem.js?v=20260718-6";
import { DaisyController } from "../systems/DaisyController.js?v=20260718-5";
import { ThrowSystem } from "../systems/ThrowSystem.js?v=20260718-4";
import { CameraSystem } from "../systems/CameraSystem.js?v=20260718-1";
import { ScoreSystem } from "../systems/ScoreSystem.js";
import { submitScore } from "../data/api.js";
import { audioSystem } from "../systems/AudioSystem.js";

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
    this.isEnding = false;
    this.throwSystem.reset(this.time.now);

    this.createLighting();
    document.querySelector("#hud").classList.add("is-active");
    document.querySelector("#hud-player").textContent = this.dataFromMenu.player?.name || "Anonymous";
    this.setupPauseControls();
    audioSystem.play("gameplay");
    this.updateHud();
  }

  setupPauseControls() {
    this.isPaused = false;
    this.pauseOverlay = document.querySelector("#pause-overlay");
    this.pauseButton = document.querySelector("#pause-toggle");
    this.resumeButton = document.querySelector("#resume-game");
    this.menuButton = document.querySelector("#pause-menu");
    this.pauseButton.classList.add("is-active");
    this.pauseButton.onclick = () => this.pauseGame();
    this.resumeButton.onclick = () => this.resumeGame();
    this.menuButton.onclick = () => this.returnToMenu();
    this.onPauseKey = (event) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (this.isPaused) this.resumeGame();
      else this.pauseGame();
    };
    this.onVisibilityChange = () => {
      if (document.hidden && !this.isPaused) this.pauseGame();
    };
    window.addEventListener("keydown", this.onPauseKey);
    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupPauseControls());
  }

  pauseGame() {
    if (this.isPaused || this.isEnding) return;
    this.isPaused = true;
    this.inputSystem.resetTouch();
    this.pauseOverlay.classList.add("is-active");
    this.pauseOverlay.setAttribute("aria-hidden", "false");
    this.pauseButton.classList.remove("is-active");
    audioSystem.setGamePaused(true);
    this.scene.pause();
  }

  resumeGame() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.pauseOverlay.classList.remove("is-active");
    this.pauseOverlay.setAttribute("aria-hidden", "true");
    this.pauseButton.classList.add("is-active");
    this.scene.resume();
    audioSystem.setGamePaused(false);
  }

  returnToMenu() {
    this.isPaused = false;
    this.pauseOverlay.classList.remove("is-active");
    this.pauseOverlay.setAttribute("aria-hidden", "true");
    document.querySelector("#hud").classList.remove("is-active");
    this.pauseButton.classList.remove("is-active");
    audioSystem.setGamePaused(false);
    audioSystem.stop();
    this.scene.start("MenuScene");
  }

  cleanupPauseControls() {
    window.removeEventListener("keydown", this.onPauseKey);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    if (this.pauseButton) {
      this.pauseButton.onclick = null;
      this.pauseButton.classList.remove("is-active");
    }
    if (this.resumeButton) this.resumeButton.onclick = null;
    if (this.menuButton) this.menuButton.onclick = null;
  }

  createLighting() {
    const haze = this.add.rectangle(0, 0, GAME.world.width, GAME.world.height, this.park.ambientTint, 0.14).setOrigin(0, 0).setDepth(80);
    haze.setBlendMode(Phaser.BlendModes.SCREEN);
    const sun = this.add.ellipse(320, 120, 380, 180, 0xffe5aa, 0.18).setDepth(-10).setScrollFactor(0.05);
    sun.setBlendMode(Phaser.BlendModes.SCREEN);
  }

  update(time, delta) {
    const now = this.time.now;
    const remaining = Math.max(0, this.roundMs - (now - this.startedAt));
    if (remaining <= 0) {
      this.endRound();
      return;
    }

    const input = this.inputSystem.getVector();
    this.daisy.update(input, delta, this.inputSystem.consumeJump());
    this.ballSystem.update(delta, this.park);
    this.throwSystem.update(now, this.balls.countActive(true), this.scoreSystem.level);

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

  showCatchFeedback(x, y) {
    const ring = this.add.circle(x, y, 18, 0xbde841, 0).setStrokeStyle(5, 0xf8ffe0, 0.95).setDepth(100);
    const label = this.add.text(x, y - 78, "+1", {
      fontFamily: "Arial, sans-serif",
      fontSize: "36px",
      fontStyle: "900",
      color: "#ffffff",
      stroke: "#244224",
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(101);
    this.tweens.add({
      targets: ring,
      radius: 86,
      alpha: 0,
      duration: 360,
      ease: "Cubic.easeOut",
      onComplete: () => ring.destroy()
    });
    this.tweens.add({
      targets: label,
      y: y - 122,
      alpha: 0,
      duration: 520,
      ease: "Cubic.easeOut",
      onComplete: () => label.destroy()
    });
  }

  endRound() {
    if (this.isEnding) return;
    this.isEnding = true;
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
    this.pauseButton?.classList.remove("is-active");
    this.scene.start("ScoreScene", payload);
  }
}
