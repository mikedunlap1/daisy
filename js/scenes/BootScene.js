import { PARKS } from "../config/parks.js";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.atlas("daisy", "./assets/daisies/daisy-sheet.png", "./assets/daisies/daisy-atlas.json");
    this.load.image("tennis-ball", "./assets/props/tennis-ball.png");
    this.load.image("chuckit", "./assets/props/chuckit.png");

    PARKS.forEach((park) => Object.entries(park.layers).forEach(([name, path]) => {
      this.load.image(`park-${park.id}-${name}`, path);
    }));

    PARKS[0].layers && Object.entries(PARKS[0].layers).forEach(([name, path]) => {
      this.load.image(`park-${name}`, path);
    });
  }

  create() {
    this.createDaisyAnimations();
    this.scene.start("MenuScene");
  }

  createDaisyAnimations() {
    const animations = [
      ["idle", 0, 5, 7],
      ["walk", 0, 7, 10],
      ["run", 0, 7, 13],
      ["sprint", 0, 7, 16],
      ["pounce", 0, 5, 14],
      ["return", 0, 7, 10],
      ["shake", 0, 7, 16],
      ["tired-flop", 0, 7, 5],
      ["zoomies-vibrate", 0, 7, 20],
      ["sassy-idle", 0, 7, 8]
    ];

    animations.forEach(([key, start, end, frameRate]) => {
      this.anims.create({
        key,
        frames: this.anims.generateFrameNames("daisy", {
          prefix: `${key}_`,
          suffix: ".png",
          start,
          end
        }),
        frameRate,
        repeat: key === "pounce" ? 0 : -1
      });
    });
  }
}
