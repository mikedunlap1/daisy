import { GAME } from "../config/game.js";

export class InputSystem {
  constructor() {
    this.vector = new Phaser.Math.Vector2(0, 0);
    this.keys = null;
    this.jumpKey = null;
    this.keyState = new Set();
    this.touchJumpQueued = false;
    this.keyboardJumpQueued = false;
    this.pointerId = null;
    this.tapTarget = null;
    this.touchDragged = false;
    this.origin = { x: 0, y: 0 };
    this.nub = document.querySelector(".touch-stick__nub");
    this.stick = document.querySelector("#touch-stick");
  }

  attach(scene) {
    this.scene = scene;
    this.keys = scene.input.keyboard.addKeys({
      up: "UP",
      down: "DOWN",
      left: "LEFT",
      right: "RIGHT",
      w: "W",
      a: "A",
      s: "S",
      d: "D"
    });
    this.jumpKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    scene.input.keyboard.addCapture(Phaser.Input.Keyboard.KeyCodes.SPACE);
    scene.input.keyboard.addCapture([
      Phaser.Input.Keyboard.KeyCodes.UP,
      Phaser.Input.Keyboard.KeyCodes.DOWN,
      Phaser.Input.Keyboard.KeyCodes.LEFT,
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    ]);
    scene.input.keyboard.enabled = true;

    const canvas = scene.game.canvas;
    canvas.tabIndex = 0;
    this.onCanvasPointerDown = () => canvas.focus();
    canvas.addEventListener("pointerdown", this.onCanvasPointerDown);
    canvas.focus({ preventScroll: true });

    this.onKeyDown = (event) => {
      if (this.shouldIgnoreKey(event)) return;
      const key = this.normalizeKey(event);
      if (this.isMovementKey(key) || key === " ") event.preventDefault();
      this.keyState.add(key);
      if (key === " ") this.keyboardJumpQueued = true;
    };

    this.onKeyUp = (event) => {
      this.keyState.delete(this.normalizeKey(event));
    };

    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp);
    this.onWindowBlur = () => this.keyState.clear();
    window.addEventListener("blur", this.onWindowBlur);

    this.onPointerDown = (pointer) => {
      if (pointer.event?.pointerType === "mouse") return;
      if (pointer.y < GAME.controls.ignoreTopPixels) return;
      pointer.event?.preventDefault?.();
      this.pointerId = pointer.id;
      this.origin = { x: pointer.x, y: pointer.y };
      this.touchDragged = false;
      this.tapTarget = scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.stick?.classList.add("is-active");
      this.stick?.style.setProperty("left", `${Math.max(18, pointer.x - 56)}px`);
      this.stick?.style.setProperty("bottom", `${Math.max(18, window.innerHeight - pointer.y - 56)}px`);
    };

    this.onPointerMove = (pointer) => {
      if (pointer.id !== this.pointerId) return;
      pointer.event?.preventDefault?.();
      const radius = GAME.controls.touchStickRadius;
      const dx = Phaser.Math.Clamp(pointer.x - this.origin.x, -radius, radius);
      const dy = Phaser.Math.Clamp(pointer.y - this.origin.y, -radius, radius);
      if (Math.abs(dx) + Math.abs(dy) > 10) {
        this.touchDragged = true;
        this.tapTarget = null;
      }
      this.vector.set(dx / radius, dy / radius);
      if (this.vector.length() > 1) this.vector.normalize();
      this.nub?.style.setProperty("transform", `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`);
    };

    this.onPointerUp = (pointer) => {
      if (pointer.id !== this.pointerId) return;
      pointer.event?.preventDefault?.();
      this.resetTouch({ preserveTapTarget: !this.touchDragged });
    };

    scene.input.on("pointerdown", this.onPointerDown);
    scene.input.on("pointermove", this.onPointerMove);
    scene.input.on("pointerup", this.onPointerUp);
    scene.input.on("pointerupoutside", this.onPointerUp);
    scene.input.on("gameout", () => this.resetTouch());
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());

    this.jumpButton = document.querySelector("#jump-button");
    this.onJumpPointerDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.touchJumpQueued = true;
    };
    this.jumpButton?.addEventListener("pointerdown", this.onJumpPointerDown);
  }

  resetTouch({ preserveTapTarget = false } = {}) {
      this.pointerId = null;
      this.vector.set(0, 0);
      if (!preserveTapTarget) this.tapTarget = null;
      this.nub?.style.setProperty("transform", "translate(-50%, -50%)");
      this.stick?.classList.remove("is-active");
  }

  destroy() {
    if (!this.scene) return;
    this.scene.input.off("pointerdown", this.onPointerDown);
    this.scene.input.off("pointermove", this.onPointerMove);
    this.scene.input.off("pointerup", this.onPointerUp);
    this.scene.input.off("pointerupoutside", this.onPointerUp);
    this.resetTouch();
    this.jumpButton?.removeEventListener("pointerdown", this.onJumpPointerDown);
    this.scene.game.canvas.removeEventListener("pointerdown", this.onCanvasPointerDown);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onWindowBlur);
    this.keyState.clear();
    this.scene = null;
  }

  getVector() {
    if (!this.keys) return this.vector.clone();
    const left = this.keys.left.isDown || this.keys.a.isDown || this.keyState.has("arrowleft") || this.keyState.has("a");
    const right = this.keys.right.isDown || this.keys.d.isDown || this.keyState.has("arrowright") || this.keyState.has("d");
    const up = this.keys.up.isDown || this.keys.w.isDown || this.keyState.has("arrowup") || this.keyState.has("w");
    const down = this.keys.down.isDown || this.keys.s.isDown || this.keyState.has("arrowdown") || this.keyState.has("s");
    const x = (left ? -1 : 0) + (right ? 1 : 0);
    const y = (up ? -1 : 0) + (down ? 1 : 0);
    const keyboard = new Phaser.Math.Vector2(x, y);
    if (keyboard.lengthSq() > 0) return keyboard.normalize();
    if (this.tapTarget && this.scene?.daisy?.sprite) {
      const daisy = this.scene.daisy.sprite;
      const direction = new Phaser.Math.Vector2(this.tapTarget.x - daisy.x, this.tapTarget.y - daisy.y);
      if (direction.length() < 38) {
        this.tapTarget = null;
      } else {
        return direction.normalize();
      }
    }
    return this.vector.clone();
  }

  consumeJump() {
    const pressed = (this.jumpKey && Phaser.Input.Keyboard.JustDown(this.jumpKey)) || this.keyboardJumpQueued || this.touchJumpQueued;
    this.keyboardJumpQueued = false;
    this.touchJumpQueued = false;
    return Boolean(pressed);
  }

  shouldIgnoreKey(event) {
    const tag = event.target?.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable;
  }

  normalizeKey(event) {
    if (event.code === "Space" || event.key === " " || event.key === "Spacebar") return " ";
    return String(event.key || "").toLowerCase();
  }

  isMovementKey(key) {
    return key === "arrowup" || key === "arrowdown" || key === "arrowleft" || key === "arrowright" || key === "w" || key === "a" || key === "s" || key === "d";
  }
}
