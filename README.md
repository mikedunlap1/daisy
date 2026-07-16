import { GAME } from "../config/game.js";

export class InputSystem {
  constructor() {
    this.vector = new Phaser.Math.Vector2(0, 0);
    this.keys = null;
    this.pointerId = null;
    this.origin = { x: 0, y: 0 };
    this.nub = document.querySelector(".touch-stick__nub");
    this.stick = document.querySelector("#touch-stick");
  }

  attach(scene) {
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

    scene.input.on("pointerdown", (pointer) => {
      if (pointer.y < GAME.controls.ignoreTopPixels) return;
      this.pointerId = pointer.id;
      this.origin = { x: pointer.x, y: pointer.y };
      this.stick?.classList.add("is-active");
      this.stick?.style.setProperty("left", `${Math.max(18, pointer.x - 56)}px`);
      this.stick?.style.setProperty("bottom", `${Math.max(18, window.innerHeight - pointer.y - 56)}px`);
    });

    scene.input.on("pointermove", (pointer) => {
      if (pointer.id !== this.pointerId) return;
      const radius = GAME.controls.touchStickRadius;
      const dx = Phaser.Math.Clamp(pointer.x - this.origin.x, -radius, radius);
      const dy = Phaser.Math.Clamp(pointer.y - this.origin.y, -radius, radius);
      this.vector.set(dx / radius, dy / radius);
      if (this.vector.length() > 1) this.vector.normalize();
      this.nub?.style.setProperty("transform", `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`);
    });

    scene.input.on("pointerup", (pointer) => {
      if (pointer.id !== this.pointerId) return;
      this.pointerId = null;
      this.vector.set(0, 0);
      this.nub?.style.setProperty("transform", "translate(-50%, -50%)");
      this.stick?.classList.remove("is-active");
    });
  }

  getVector() {
    const x = (this.keys.left.isDown || this.keys.a.isDown ? -1 : 0) + (this.keys.right.isDown || this.keys.d.isDown ? 1 : 0);
    const y = (this.keys.up.isDown || this.keys.w.isDown ? -1 : 0) + (this.keys.down.isDown || this.keys.s.isDown ? 1 : 0);
    const keyboard = new Phaser.Math.Vector2(x, y);
    if (keyboard.lengthSq() > 0) return keyboard.normalize();
    return this.vector.clone();
  }
}
