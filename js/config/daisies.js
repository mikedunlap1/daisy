export const DAISIES = [
  {
    id: "sassy",
    name: "Sassy Daisy",
    blurb: "Catches the ball, judges the throw, invoices emotionally.",
    stats: { speed: 1.0, acceleration: 1.0, turnRadius: 0.9, stamina: 1.0, focus: 1.15 },
    sprite: "daisy",
    idleAnimation: "sassy-idle"
  },
  {
    id: "tired",
    name: "Tired Daisy",
    blurb: "Technically participating. Spiritually on the couch.",
    stats: { speed: 0.72, acceleration: 0.72, turnRadius: 0.62, stamina: 0.48, focus: 0.75 },
    sprite: "daisy",
    idleAnimation: "tired-flop",
    behavior: { randomStops: true }
  },
  {
    id: "zoomies",
    name: "Zoomies Daisy",
    blurb: "Ninety percent legs, ten percent judgment.",
    stats: { speed: 1.35, acceleration: 1.4, turnRadius: 0.7, stamina: 0.62, focus: 0.5 },
    sprite: "daisy",
    idleAnimation: "zoomies-vibrate"
  }
];
