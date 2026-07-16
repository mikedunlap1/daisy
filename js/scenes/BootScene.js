import { PARKS } from "../config/parks.js";

const W = 1536;
const H = 864;
const FRAME_W = 192;
const FRAME_H = 208;
const PET_ROWS = {
  idle: 0,
  walk: 1,
  run: 1,
  sprint: 1,
  pounce: 4,
  return: 1,
  shake: 3,
  "tired-flop": 6,
  "zoomies-vibrate": 7,
  "sassy-idle": 8
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.spritesheet("daisy", "./assets/daisies/daisy-pet-sheet.png", {
      frameWidth: FRAME_W,
      frameHeight: FRAME_H
    });
  }

  create() {
    this.createParkTextures();
    this.createPropTextures();
    this.createDaisyAnimations();
    this.scene.start("MenuScene");
  }

  createParkTextures() {
    PARKS.forEach((park, parkIndex) => {
      ["sky", "far", "mid", "near", "ground", "foreground"].forEach((layer) => {
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        drawParkLayer(ctx, layer, park.previewColor, parkIndex);
        this.textures.addCanvas(`park-${park.id}-${layer}`, canvas);
        if (parkIndex === 0) this.textures.addCanvas(`park-${layer}`, canvas);
      });
    });
  }

  createPropTextures() {
    const ball = document.createElement("canvas");
    ball.width = 96;
    ball.height = 96;
    const b = ball.getContext("2d");
    b.fillStyle = "#bde841";
    b.strokeStyle = "#f7f9df";
    b.lineWidth = 6;
    b.beginPath();
    b.arc(48, 48, 36, 0, Math.PI * 2);
    b.fill();
    b.strokeStyle = "#7da82d";
    b.lineWidth = 2;
    b.stroke();
    b.strokeStyle = "#f7f9df";
    b.lineWidth = 5;
    b.beginPath();
    b.arc(48, 48, 27, -1.25, 1.25);
    b.stroke();
    b.beginPath();
    b.arc(48, 48, 27, 1.9, 4.35);
    b.stroke();
    this.textures.addCanvas("tennis-ball", ball);

    const chuck = document.createElement("canvas");
    chuck.width = 220;
    chuck.height = 120;
    const c = chuck.getContext("2d");
    c.strokeStyle = "#1f68d7";
    c.lineWidth = 16;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(24, 100);
    c.lineTo(160, 28);
    c.stroke();
    c.strokeStyle = "#1657ba";
    c.lineWidth = 12;
    c.beginPath();
    c.arc(172, 38, 26, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = "#bde841";
    c.beginPath();
    c.arc(174, 38, 15, 0, Math.PI * 2);
    c.fill();
    this.textures.addCanvas("chuckit", chuck);
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
      const row = PET_ROWS[key] ?? 0;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers("daisy", {
          start: row * 8 + start,
          end: row * 8 + end
        }),
        frameRate,
        repeat: key === "pounce" ? 0 : -1
      });
    });
  }
}

function drawParkLayer(ctx, layer, skyTop, seed) {
  ctx.clearRect(0, 0, W, H);
  if (layer === "sky") {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, skyTop);
    gradient.addColorStop(0.72, "#82cbd6");
    gradient.addColorStop(1, "#f4d7a6");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255, 248, 225, .75)";
    for (let i = 0; i < 4; i += 1) cloud(ctx, 150 + i * 360 + seed * 30, 120 + i * 26, 1 + i * 0.1);
    return;
  }

  if (layer === "far") {
    ctx.fillStyle = "rgba(44, 95, 65, .82)";
    for (let x = -40; x < W + 80; x += 80) {
      ctx.beginPath();
      ctx.arc(x, 460 + Math.sin(x * 0.01) * 20, 75, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(65, 52, 42, .72)";
    ctx.lineWidth = 8;
    for (let x = 90; x < W; x += 270) {
      ctx.beginPath();
      ctx.moveTo(x, 300);
      ctx.lineTo(x, 540);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(35, 38, 38, .45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = -40; x < W + 80; x += 40) {
      const y = 332 + Math.sin(x / 80) * 16;
      if (x === -40) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    return;
  }

  if (layer === "mid") {
    const y = 528;
    ctx.strokeStyle = "rgba(210, 220, 210, .58)";
    ctx.lineWidth = 3;
    for (let x = -40; x < W + 40; x += 36) line(ctx, x, y - 130, x, y + 34);
    for (let yy = y - 120; yy < y + 40; yy += 30) line(ctx, 0, yy, W, yy + 4);
    for (let x = -80; x < W; x += 42) {
      line(ctx, x, y + 30, x + 120, y - 130);
      line(ctx, x, y - 130, x + 120, y + 30);
    }
    ctx.fillStyle = "#76583a";
    ctx.fillRect(230, y - 14, 210, 18);
    ctx.fillRect(250, y - 54, 175, 18);
    ctx.fillStyle = "#547b87";
    ctx.fillRect(830, y - 42, 42, 58);
    return;
  }

  if (layer === "near") {
    ctx.fillStyle = "#559950";
    ctx.fillRect(0, 590, W, H);
    ctx.fillStyle = "rgba(114, 92, 56, .45)";
    for (let i = 0; i < 26; i += 1) {
      const x = (i * 137 + seed * 91) % W;
      const y = 650 + ((i * 47) % 180);
      ellipse(ctx, x, y, 52, 13);
    }
    ctx.strokeStyle = "rgba(250, 244, 195, .35)";
    ctx.lineWidth = 5;
    line(ctx, 0, 690, W, 672);
    grass(ctx, 590, 900, 1200, seed);
    return;
  }

  if (layer === "ground") {
    grass(ctx, 620, 900, 520, seed + 4);
    return;
  }

  if (layer === "foreground") {
    ctx.strokeStyle = "rgba(26, 82, 41, .42)";
    ctx.lineWidth = 6;
    for (let i = 0; i < 80; i += 1) {
      const x = (i * 67 + seed * 55) % W;
      const y = 760 + ((i * 29) % 130);
      line(ctx, x, y, x + Math.sin(i) * 20, y - 80 - (i % 40));
    }
  }
}

function drawDaisyFrame(ctx, ox, oy, animation, frame) {
  const t = frame / 7;
  const phase = Math.sin(t * Math.PI * 2);
  const fast = ["run", "sprint", "zoomies-vibrate"].includes(animation);
  const bob = Math.sin(t * Math.PI * (fast ? 4 : 2)) * (fast ? 5 : 3);
  const lean = fast ? 8 : 2;
  ctx.save();
  ctx.translate(ox, oy);
  if (animation === "tired-flop") {
    fillEllipse(ctx, 44, 78, 86, 28, "#151818");
    fillEllipse(ctx, 77, 76, 62, 24, "#efeddb");
    spots(ctx, 76, 72, 46, 22, frame);
    fillEllipse(ctx, 118, 75, 34, 24, "#efeddb");
    triangle(ctx, 104, 68, 124, 50, 132, 70, "#151818");
    ctx.restore();
    return;
  }
  for (let i = 0; i < 4; i += 1) {
    const lx = [51, 72, 93, 110][i] + lean;
    const foot = phase * (i % 2 ? -8 : 8);
    ctx.strokeStyle = i % 2 ? "#efeddb" : "#151818";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    line(ctx, lx, 76 + bob, lx + foot, 110);
    ctx.strokeStyle = "#efeddb";
    line(ctx, lx + foot, 100, lx + foot + 4, 116);
  }
  fillEllipse(ctx, 78 + lean, 64 + bob, 88, 43, "#151818");
  fillEllipse(ctx, 86 + lean, 68 + bob, 48, 38, "#efeddb");
  spots(ctx, 68 + lean, 52 + bob, 42, 35, frame + 11);
  ctx.strokeStyle = "#151818";
  ctx.lineWidth = 10;
  line(ctx, 38 + lean, 56 + bob, 18 + lean, 42 + bob + phase * 6);
  ctx.strokeStyle = "#efeddb";
  line(ctx, 24 + lean, 45 + bob, 8 + lean, 36 + bob + phase * 6);
  fillEllipse(ctx, 126 + lean, 50 + bob, 48, 43, "#151818");
  triangle(ctx, 115 + lean, 35 + bob, 107 + lean, 4 + bob, 130 + lean, 30 + bob, "#151818");
  triangle(ctx, 137 + lean, 35 + bob, 150 + lean, 6 + bob, 148 + lean, 43 + bob, "#151818");
  triangle(ctx, 122 + lean, 30 + bob, 138 + lean, 31 + bob, 137 + lean, 66 + bob, "#efeddb");
  spots(ctx, 119 + lean, 31 + bob, 24, 34, frame + 20);
  fillEllipse(ctx, 121 + lean, 48 + bob, 8, 7, "#b68155");
  fillEllipse(ctx, 141 + lean, 48 + bob, 8, 7, "#b68155");
  fillEllipse(ctx, 132 + lean, 44 + bob, 7, 8, "#080808");
  fillEllipse(ctx, 148 + lean, 57 + bob, 9, 7, "#080808");
  if (["idle", "sassy-idle"].includes(animation) && [1, 2, 5].includes(frame)) triangle(ctx, 130 + lean, 61 + bob, 142 + lean, 63 + bob, 136 + lean, 77 + bob, "#e07791");
  if (animation === "return") fillEllipse(ctx, 144 + lean, 72 + bob, 21, 20, "#bde841");
  ctx.restore();
}

function cloud(ctx, x, y, scale) {
  for (let i = 0; i < 8; i += 1) fillEllipse(ctx, x + i * 38 * scale, y + Math.sin(i) * 12, 70 * scale, 36 * scale, "rgba(255, 250, 232, .78)");
}

function grass(ctx, minY, maxY, count, seed) {
  for (let i = 0; i < count; i += 1) {
    const x = (i * 37 + seed * 101) % W;
    const y = minY + ((i * 53) % Math.max(1, maxY - minY));
    ctx.strokeStyle = i % 5 ? "rgba(56, 125, 58, .55)" : "rgba(222, 214, 86, .45)";
    ctx.lineWidth = i % 3 ? 1 : 2;
    line(ctx, x, y, x + ((i % 7) - 3), y - 5 - (i % 9));
  }
}

function spots(ctx, x, y, w, h, seed) {
  ctx.fillStyle = "rgba(34, 34, 31, .68)";
  for (let i = 0; i < 20; i += 1) fillEllipse(ctx, x + ((i * 17 + seed * 9) % w), y + ((i * 13 + seed * 5) % h), 3 + (i % 3), 3 + (i % 2));
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function fillEllipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ellipse(ctx, x, y, rx, ry);
}

function triangle(ctx, x1, y1, x2, y2, x3, y3, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fill();
}
