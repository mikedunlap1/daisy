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
    scene.input.keyboard.enabled = true;

    this.onPointerDown = (pointer) => {
      if (pointer.y < GAME.controls.ignoreTopPixels) return;
      pointer.event?.preventDefault?.();
      this.pointerId = pointer.id;
      this.origin = { x: pointer.x, y: pointer.y };
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
      this.vector.set(dx / radius, dy / radius);
      if (this.vector.length() > 1) this.vector.normalize();
      this.nub?.style.setProperty("transform", `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`);
    };

    this.onPointerUp = (pointer) => {
      if (pointer.id !== this.pointerId) return;
      pointer.event?.preventDefault?.();
      this.resetTouch();
    };

    scene.input.on("pointerdown", this.onPointerDown);
    scene.input.on("pointermove", this.onPointerMove);
    scene.input.on("pointerup", this.onPointerUp);
    scene.input.on("pointerupoutside", this.onPointerUp);
    scene.input.on("gameout", () => this.resetTouch());
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.destroy());
  }

  resetTouch() {
      this.pointerId = null;
      this.vector.set(0, 0);
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
    this.scene = null;
  }

  getVector() {
    if (!this.keys) return this.vector.clone();
    const x = (this.keys.left.isDown || this.keys.a.isDown ? -1 : 0) + (this.keys.right.isDown || this.keys.d.isDown ? 1 : 0);
    const y = (this.keys.up.isDown || this.keys.w.isDown ? -1 : 0) + (this.keys.down.isDown || this.keys.s.isDown ? 1 : 0);
    const keyboard = new Phaser.Math.Vector2(x, y);
    if (keyboard.lengthSq() > 0) return keyboard.normalize();
    return this.vector.clone();
  }
}
