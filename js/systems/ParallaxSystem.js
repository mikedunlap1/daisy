export class ParallaxSystem {
  constructor(scene, park, world) {
    this.scene = scene;
    this.park = park;
    this.layers = [];
    this.create(world);
  }

  create(world) {
    const order = ["sky", "far", "mid", "near", "ground", "foreground"];
    order.forEach((name, index) => {
      const image = this.scene.add.image(0, 0, `park-${this.park.id}-${name}`);
      image.setOrigin(0, 0);
      image.setDisplaySize(world.width, world.height);
      image.setDepth(index - 20);
      // Finite artwork must never outrun the world edge. Values above 1 only
      // worked when the old TileSprite could silently repeat its texture.
      const configuredFactor = this.park.parallax[name] ?? 1;
      const factor = this.park.id === "backyard" && name === "sky" ? 1 : configuredFactor;
      image.setScrollFactor(Math.min(1, factor));
      if (name === "foreground") image.setAlpha(0.78);
      this.layers.push({ name, image });
    });
  }

  update() {}
}
