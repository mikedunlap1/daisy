export const PARKS = [
  {
    id: "backyard",
    name: "Mom & Dad's Backyard",
    blurb: "Home-field advantage, suspicious turf, elite snack proximity.",
    groundFriction: 0.88,
    ambientTint: 0xffe0b1,
    previewColor: "#f0b06d",
    layers: {
      sky: "./assets/parks/backyard/sky.png",
      far: "./assets/parks/backyard/far.png",
      mid: "./assets/parks/backyard/mid.png",
      near: "./assets/parks/backyard/near.png",
      ground: "./assets/parks/backyard/ground.png",
      foreground: "./assets/parks/backyard/foreground.png"
    },
    parallax: { sky: 0.02, far: 0.1, mid: 0.3, near: 0.54, ground: 1, foreground: 1.18 }
  }
];
