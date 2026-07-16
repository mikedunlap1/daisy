export const PARKS = [
  {
    id: "north-park",
    name: "North Park",
    blurb: "Big sky, old fence, field lines that quit years ago.",
    groundFriction: 0.94,
    ambientTint: 0xffeeca,
    preview: "./assets/parks/north-park/preview.png",
    layers: {
      sky: "./assets/parks/north-park/sky.png",
      far: "./assets/parks/north-park/far.png",
      mid: "./assets/parks/north-park/mid.png",
      near: "./assets/parks/north-park/near.png",
      ground: "./assets/parks/north-park/ground.png",
      foreground: "./assets/parks/north-park/foreground.png"
    },
    parallax: { sky: 0.02, far: 0.13, mid: 0.34, near: 0.62, ground: 1, foreground: 1.24 }
  },
  {
    id: "south-park",
    name: "South Park",
    blurb: "Warm grass, sleepy trees, one trash can doing its best.",
    groundFriction: 0.91,
    ambientTint: 0xffe8ba,
    preview: "./assets/parks/south-park/preview.png",
    layers: {
      sky: "./assets/parks/south-park/sky.png",
      far: "./assets/parks/south-park/far.png",
      mid: "./assets/parks/south-park/mid.png",
      near: "./assets/parks/south-park/near.png",
      ground: "./assets/parks/south-park/ground.png",
      foreground: "./assets/parks/south-park/foreground.png"
    },
    parallax: { sky: 0.02, far: 0.12, mid: 0.32, near: 0.58, ground: 1, foreground: 1.22 }
  },
  {
    id: "backyard",
    name: "Mom & Dad's Backyard",
    blurb: "Home-field advantage, suspicious turf, elite snack proximity.",
    groundFriction: 0.88,
    ambientTint: 0xffe0b1,
    preview: "./assets/parks/backyard/preview.png",
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
