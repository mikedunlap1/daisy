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
      const tile = this.scene.add.tileSprite(0, 0, world.width, world.height, `park-${this.park.id}-${name}`);
      tile.setOrigin(0, 0);
      tile.setDepth(index - 20);
      tile.setScrollFactor(0);
      if (name === "foreground") tile.setAlpha(0.78);
      this.layers.push({ name, tile, factor: this.park.parallax[name] ?? 1 });
    });
  }

  update(camera) {
    this.layers.forEach(({ tile, factor, name }) => {
      tile.tilePositionX = camera.scrollX * factor;
      tile.tilePositionY = name === "sky" ? camera.scrollY * 0.02 : camera.scrollY * factor * 0.22;
    });
  }
}
