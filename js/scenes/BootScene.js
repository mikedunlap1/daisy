import { PARKS } from "../config/parks.js";

const W = 1536;
const H = 864;
const FRAME_W = 190;
const FRAME_H = 150;
const DAISY_ROWS = ["idle", "walk", "run", "sprint", "pounce", "return", "shake", "tired-flop", "zoomies-vibrate", "sassy-idle"];

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  create() {
    this.createParkTextures();
    this.createPropTextures();
    this.createDaisyTexture();
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

  createDaisyTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = FRAME_W * 8;
    canvas.height = FRAME_H * DAISY_ROWS.length;
    const ctx = canvas.getContext("2d");

    DAISY_ROWS.forEach((animation, row) => {
      for (let frame = 0; frame < 8; frame += 1) {
        drawDaisyFrame(ctx, frame * FRAME_W, row * FRAME_H, animation, frame);
      }
    });

    const texture = this.textures.addCanvas("daisy", canvas);
    DAISY_ROWS.forEach((animation, row) => {
      for (let frame = 0; frame < 8; frame += 1) {
        texture.add(`${animation}_${frame}.png`, 0, frame * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H);
      }
    });
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

function drawParkLayer(ctx, layer, skyTop, seed) {
  ctx.clearRect(0, 0, W, H);
  if (layer === "sky") {
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#8ed7ff");
    gradient.addColorStop(0.62, "#c7ecf6");
    gradient.addColorStop(1, "#ffe5b5");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    const sun = ctx.createRadialGradient(1160, 120, 20, 1160, 120, 230);
    sun.addColorStop(0, "rgba(255, 248, 190, .95)");
    sun.addColorStop(1, "rgba(255, 222, 112, 0)");
    ctx.fillStyle = sun;
    ctx.fillRect(850, 0, 520, 360);
    ctx.fillStyle = "rgba(255, 248, 225, .75)";
    cloud(ctx, 120, 110, 0.85);
    cloud(ctx, 760, 86, 0.7);
    return;
  }

  if (layer === "far") {
    drawHouseHint(ctx, 60, 286, "#d56f52", "#fff3d7");
    drawHouseHint(ctx, 1120, 300, "#7bb2c0", "#fff6df");
    for (let x = -80; x < W + 120; x += 130) drawTree(ctx, x + (seed * 17) % 60, 470 + Math.sin(x * 0.01) * 16, 0.75 + (x % 3) * 0.06);
    return;
  }

  if (layer === "mid") {
    drawFence(ctx, 0, 484, W, seed);
    drawTrashCan(ctx, 1180, 520, 1);
    drawTrashBag(ctx, 1250, 560, 0.75);
    drawTrashBag(ctx, 1315, 570, 0.6);
    drawBallBucket(ctx, 280, 548);
    drawBushLine(ctx, seed);
    return;
  }

  if (layer === "near") {
    const grassGradient = ctx.createLinearGradient(0, 570, 0, H);
    grassGradient.addColorStop(0, "#7fc15a");
    grassGradient.addColorStop(1, "#4a993f");
    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, 590, W, H);
    ctx.fillStyle = "rgba(92, 75, 43, .24)";
    for (let i = 0; i < 34; i += 1) {
      const x = (i * 137 + seed * 91) % W;
      const y = 650 + ((i * 47) % 180);
      ellipse(ctx, x, y, 52, 13);
    }
    ctx.fillStyle = "rgba(255,255,255,.16)";
    for (let x = -160; x < W + 200; x += 360) fillEllipse(ctx, x, 762 + Math.sin(x) * 12, 210, 34);
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
  const bob = Math.sin(t * Math.PI * (fast ? 4 : 2)) * (fast ? 7 : 4);
  const lean = fast ? 15 : animation === "pounce" ? 22 : 4;
  ctx.save();
  ctx.translate(ox, oy);

  if (animation === "tired-flop") {
    fillEllipse(ctx, 76, 100, 82, 24, "#151818");
    fillEllipse(ctx, 102, 98, 60, 22, "#f2f0de");
    spots(ctx, 88, 87, 56, 24, frame);
    fillEllipse(ctx, 146, 92, 30, 22, "#f2f0de");
    triangle(ctx, 135, 80, 152, 55, 161, 84, "#151818");
    ctx.restore();
    return;
  }

  if (animation === "pounce") {
    ctx.rotate(-0.05);
  }

  for (let i = 0; i < 4; i += 1) {
    const lx = [55, 78, 104, 127][i] + lean;
    const stride = fast ? 18 : 10;
    const foot = phase * (i % 2 ? -stride : stride);
    ctx.strokeStyle = i % 2 ? "#efeddb" : "#151818";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    line(ctx, lx, 84 + bob, lx + foot, 130);
    ctx.strokeStyle = "#efeddb";
    line(ctx, lx + foot, 116, lx + foot + 6, 136);
  }

  fillEllipse(ctx, 92 + lean, 72 + bob, 92, 45, "#151818");
  fillEllipse(ctx, 100 + lean, 77 + bob, 52, 39, "#f2f0de");
  spots(ctx, 80 + lean, 56 + bob, 52, 42, frame + 11);

  ctx.strokeStyle = "#151818";
  ctx.lineWidth = 12;
  line(ctx, 49 + lean, 64 + bob, 22 + lean, 48 + bob + phase * 7);
  ctx.strokeStyle = "#f2f0de";
  line(ctx, 31 + lean, 52 + bob, 13 + lean, 42 + bob + phase * 7);

  fillEllipse(ctx, 146 + lean, 53 + bob, 46, 42, "#151818");
  triangle(ctx, 132 + lean, 39 + bob, 121 + lean, 4 + bob, 149 + lean, 33 + bob, "#151818");
  triangle(ctx, 158 + lean, 38 + bob, 174 + lean, 7 + bob, 171 + lean, 48 + bob, "#151818");
  triangle(ctx, 140 + lean, 32 + bob, 158 + lean, 32 + bob, 156 + lean, 68 + bob, "#f2f0de");
  spots(ctx, 138 + lean, 31 + bob, 25, 35, frame + 20);
  fillEllipse(ctx, 135 + lean, 49 + bob, 8, 7, "#b68155");
  fillEllipse(ctx, 156 + lean, 49 + bob, 8, 7, "#b68155");
  fillEllipse(ctx, 145 + lean, 44 + bob, 7, 8, "#080808");
  fillEllipse(ctx, 165 + lean, 58 + bob, 9, 7, "#080808");
  if (["idle", "sassy-idle"].includes(animation) && [1, 2, 5].includes(frame)) triangle(ctx, 148 + lean, 64 + bob, 162 + lean, 66 + bob, 155 + lean, 82 + bob, "#e07791");
  if (animation === "return") fillEllipse(ctx, 166 + lean, 78 + bob, 22, 20, "#bde841");
  ctx.restore();
}

function cloud(ctx, x, y, scale) {
  for (let i = 0; i < 8; i += 1) fillEllipse(ctx, x + i * 38 * scale, y + Math.sin(i) * 12, 70 * scale, 36 * scale, "rgba(255, 250, 232, .78)");
}

function drawHouseHint(ctx, x, y, wall, trim) {
  ctx.fillStyle = "rgba(67, 54, 40, .16)";
  ctx.fillRect(x + 10, y + 28, 330, 178);
  ctx.fillStyle = wall;
  ctx.fillRect(x, y + 45, 330, 160);
  triangle(ctx, x - 22, y + 50, x + 170, y - 40, x + 360, y + 50, "#6d4a37");
  ctx.fillStyle = trim;
  ctx.fillRect(x + 48, y + 92, 58, 56);
  ctx.fillRect(x + 206, y + 86, 64, 62);
  ctx.fillStyle = "rgba(70, 115, 145, .42)";
  ctx.fillRect(x + 56, y + 100, 42, 40);
  ctx.fillRect(x + 214, y + 94, 48, 46);
}

function drawTree(ctx, x, y, scale) {
  ctx.strokeStyle = "#73502f";
  ctx.lineWidth = 18 * scale;
  line(ctx, x, y - 20 * scale, x + 10 * scale, y + 100 * scale);
  fillEllipse(ctx, x - 38 * scale, y - 88 * scale, 78 * scale, 70 * scale, "rgba(43, 113, 64, .9)");
  fillEllipse(ctx, x + 24 * scale, y - 118 * scale, 86 * scale, 82 * scale, "rgba(59, 139, 74, .92)");
  fillEllipse(ctx, x + 75 * scale, y - 72 * scale, 72 * scale, 62 * scale, "rgba(39, 103, 58, .9)");
}

function drawFence(ctx, x, y, width, seed) {
  ctx.fillStyle = "#b98a55";
  ctx.fillRect(x, y + 84, width, 22);
  ctx.fillStyle = "#d2a66f";
  ctx.fillRect(x, y + 28, width, 18);
  for (let px = -20; px < width + 40; px += 54) {
    const wobble = Math.sin((px + seed * 23) * 0.02) * 5;
    ctx.fillStyle = px % 108 === 0 ? "#c6975f" : "#d7ad74";
    ctx.fillRect(px, y + wobble, 36, 138);
    triangle(ctx, px, y + wobble, px + 18, y - 28 + wobble, px + 36, y + wobble, ctx.fillStyle);
    ctx.fillStyle = "rgba(81, 55, 34, .2)";
    ctx.fillRect(px + 29, y + 10 + wobble, 4, 118);
  }
}

function drawTrashCan(ctx, x, y, scale) {
  fillEllipse(ctx, x + 20 * scale, y + 70 * scale, 48 * scale, 13 * scale, "rgba(29, 35, 32, .22)");
  ctx.fillStyle = "#607c86";
  ctx.fillRect(x, y, 48 * scale, 70 * scale);
  fillEllipse(ctx, x + 24 * scale, y, 28 * scale, 8 * scale, "#7f9aa3");
  ctx.fillStyle = "#506a73";
  ctx.fillRect(x - 5 * scale, y - 11 * scale, 58 * scale, 11 * scale);
  ctx.strokeStyle = "rgba(255,255,255,.28)";
  ctx.lineWidth = 3 * scale;
  line(ctx, x + 14 * scale, y + 10 * scale, x + 10 * scale, y + 62 * scale);
  line(ctx, x + 32 * scale, y + 10 * scale, x + 36 * scale, y + 62 * scale);
}

function drawTrashBag(ctx, x, y, scale) {
  fillEllipse(ctx, x, y, 42 * scale, 30 * scale, "#28312d");
  triangle(ctx, x - 8 * scale, y - 24 * scale, x + 4 * scale, y - 50 * scale, x + 14 * scale, y - 20 * scale, "#202723");
  fillEllipse(ctx, x - 12 * scale, y - 8 * scale, 10 * scale, 7 * scale, "rgba(255,255,255,.12)");
}

function drawBallBucket(ctx, x, y) {
  ctx.fillStyle = "rgba(28, 40, 31, .2)";
  fillEllipse(ctx, x + 48, y + 48, 74, 16);
  ctx.fillStyle = "#ef7c3a";
  ctx.fillRect(x, y, 94, 52);
  fillEllipse(ctx, x + 47, y, 52, 12, "#ff9c4c");
  for (let i = 0; i < 5; i += 1) fillEllipse(ctx, x + 18 + i * 15, y - 5 - (i % 2) * 4, 11, 11, "#bde841");
}

function drawBushLine(ctx, seed) {
  for (let x = -80; x < W + 80; x += 92) {
    const y = 582 + Math.sin((x + seed) * 0.02) * 10;
    fillEllipse(ctx, x, y, 64, 30, x % 3 ? "#3f8d4d" : "#367a45");
    fillEllipse(ctx, x + 42, y + 8, 52, 24, "#4d9f56");
  }
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
