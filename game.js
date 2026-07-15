const ui = {
  status: document.querySelector("#status-copy"),
  runState: document.querySelector("#run-state"),
  hint: document.querySelector("#hint"),
  score: document.querySelector("#score"),
  streak: document.querySelector("#streak"),
  energy: document.querySelector("#energy"),
  energyMeter: document.querySelector("#energy-meter"),
  treats: document.querySelector("#treats"),
  throwButton: document.querySelector("#throw-button"),
  restButton: document.querySelector("#rest-button"),
  resetButton: document.querySelector("#reset-button"),
};

const gameState = {
  score: 0,
  streak: 0,
  energy: 100,
  treats: 3,
  busy: false,
  highScore: Number(localStorage.getItem("daisy-high-score") || 0),
};

function setStatus(state, message) {
  ui.runState.textContent = state;
  ui.status.textContent = message;
}

function updateHud() {
  ui.score.textContent = gameState.score.toLocaleString();
  ui.streak.textContent = gameState.streak;
  ui.energy.textContent = Math.round(gameState.energy);
  ui.energyMeter.style.width = `${Math.max(0, Math.min(100, gameState.energy))}%`;
  ui.treats.textContent = gameState.treats;
  ui.hint.textContent =
    gameState.highScore > 0
      ? `Best score: ${gameState.highScore.toLocaleString()}`
      : "Press Space or throw the ball.";
}

function bootFailure() {
  setStatus("Missing Engine", "Phaser did not load. Check the script include or network access.");
  ui.throwButton.disabled = true;
  ui.restButton.disabled = true;
  ui.resetButton.disabled = true;
}

function createDraggableCards() {
  const cards = [...document.querySelectorAll("[data-card]")];
  const stored = JSON.parse(localStorage.getItem("daisy-card-layout") || "{}");
  const drag = { card: null, startX: 0, startY: 0, baseX: 0, baseY: 0 };

  cards.forEach((card, index) => {
    const saved = stored[index] || { x: 0, y: 0 };
    card.dataset.cardIndex = String(index);
    card.dataset.x = String(saved.x);
    card.dataset.y = String(saved.y);
    card.style.transform = `translate3d(${saved.x}px, ${saved.y}px, 0)`;

    card.addEventListener("pointerdown", (event) => {
      drag.card = card;
      drag.startX = event.clientX;
      drag.startY = event.clientY;
      drag.baseX = Number(card.dataset.x || 0);
      drag.baseY = Number(card.dataset.y || 0);
      card.setPointerCapture(event.pointerId);
    });

    card.addEventListener("pointermove", (event) => {
      if (drag.card !== card) return;
      const x = Math.max(-70, Math.min(70, drag.baseX + event.clientX - drag.startX));
      const y = Math.max(-70, Math.min(70, drag.baseY + event.clientY - drag.startY));
      card.dataset.x = String(x);
      card.dataset.y = String(y);
      card.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });

    card.addEventListener("pointerup", () => {
      if (drag.card !== card) return;
      drag.card = null;
      const next = {};
      cards.forEach((item, cardIndex) => {
        next[cardIndex] = {
          x: Number(item.dataset.x || 0),
          y: Number(item.dataset.y || 0),
        };
      });
      localStorage.setItem("daisy-card-layout", JSON.stringify(next));
    });
  });
}

function drawPixelDaisy(scene, x, y) {
  const dog = scene.add.container(x, y);
  dog.setSize(92, 58);
  dog.setData("facing", 1);

  function px(rx, ry, w, h, color, alpha = 1) {
    const rect = scene.add.rectangle(rx, ry, w, h, color, alpha).setOrigin(0, 0);
    dog.add(rect);
    return rect;
  }

  px(-40, -28, 58, 26, 0x8197a8);
  px(-34, -25, 11, 22, 0xe5edf0);
  px(-16, -25, 8, 22, 0xd5e0e6);
  px(2, -25, 15, 24, 0x111218);
  px(-48, -17, 10, 7, 0xf2f4ef);
  px(-30, -20, 5, 5, 0x151720);
  px(-5, -19, 5, 5, 0x151720);

  px(12, -40, 32, 30, 0x0e0f14);
  px(31, -28, 20, 16, 0xf0e4d2);
  px(39, -23, 7, 5, 0x07070a);
  px(28, -31, 4, 4, 0xffffff);
  px(23, -60, 12, 25, 0x090a0f);
  px(38, -59, 13, 25, 0x090a0f);
  px(42, -18, 8, 3, 0xea8d99);

  px(12, -12, 10, 20, 0xdde7ea);
  px(-27, -8, 9, 18, 0xdde7ea);

  dog.setScale(0.62);
  return dog;
}

function bootGame() {
  if (!window.Phaser) {
    bootFailure();
    return;
  }

  class DaisyFetchScene extends Phaser.Scene {
    constructor() {
      super("DaisyFetchScene");
    }

    create() {
      this.cameras.main.setBackgroundColor("rgba(0,0,0,0)");
      this.width = this.scale.width;
      this.height = this.scale.height;
      this.vanish = { x: 625, y: 150 };
      this.drawWorld();

      this.trail = this.add.graphics().setDepth(5);
      this.shadow = this.add.ellipse(336, 392, 70, 12, 0x000000, 0.45).setDepth(6);
      this.daisy = drawPixelDaisy(this, 336, 360).setDepth(8);
      this.ball = this.add.circle(790, 348, 13, 0xc7f43a, 1).setDepth(9);
      this.ball.setStrokeStyle(4, 0x84b816, 1);

      this.statusText = this.add
        .text(30, 26, "CLICK / SPACE TO THROW", {
          color: "#777b8d",
          fontFamily: "monospace",
          fontSize: "14px",
        })
        .setDepth(20);

      this.add
        .text(30, 50, "Ball travels toward the vanishing point. Daisy scales down to chase it.", {
          color: "#a5aac0",
          fontFamily: "monospace",
          fontSize: "12px",
        })
        .setDepth(20);

      this.input.on("pointerdown", (pointer) => {
        if (pointer.y > 82) this.throwBall();
      });
      this.input.keyboard?.on("keydown-SPACE", () => this.throwBall());

      window.addEventListener("daisy:throw", this.throwBallBound = () => this.throwBall());
      window.addEventListener("daisy:rest", this.restBound = () => this.restDaisy());
      window.addEventListener("daisy:reset", this.resetBound = () => this.resetRun());

      this.tweens.add({
        targets: this.daisy,
        y: 354,
        duration: 620,
        yoyo: true,
        repeat: -1,
        ease: "Sine.inOut",
      });

      setStatus("Ready", "Daisy is tiny, locked in, and waiting for the throw.");
      updateHud();
    }

    drawWorld() {
      const g = this.add.graphics();
      g.fillStyle(0x246bfd, 0.08);
      g.fillEllipse(740, 302, 800, 250);
      g.fillStyle(0x6d3cff, 0.06);
      g.fillEllipse(430, 260, 600, 230);

      g.fillStyle(0xf4f5fa, 0.34);
      [
        [86, 72], [190, 134], [305, 54], [535, 96], [872, 76],
        [1018, 130], [1104, 70], [143, 214], [724, 222], [960, 238],
      ].forEach(([x, y]) => g.fillRect(x, y, 3, 3));

      g.fillStyle(0x111626, 0.8);
      g.beginPath();
      g.moveTo(0, 330);
      g.lineTo(120, 260);
      g.lineTo(246, 308);
      g.lineTo(386, 236);
      g.lineTo(520, 292);
      g.lineTo(690, 212);
      g.lineTo(905, 292);
      g.lineTo(1038, 216);
      g.lineTo(1200, 300);
      g.lineTo(1200, 520);
      g.lineTo(0, 520);
      g.closePath();
      g.fillPath();

      g.lineStyle(2, 0x3458c8, 0.35);
      g.beginPath();
      g.moveTo(70, 404);
      g.lineTo(1130, 404);
      g.strokePath();

      for (let i = 0; i < 12; i += 1) {
        const startX = 70 + i * 96;
        g.lineStyle(1, 0x3458c8, 0.13);
        g.beginPath();
        g.moveTo(startX, 520);
        g.lineTo(this.vanish.x, this.vanish.y);
        g.strokePath();
      }

      for (let i = 0; i < 7; i += 1) {
        const y = 414 - i * 34;
        g.lineStyle(1, 0x6d3cff, 0.28 - i * 0.032);
        g.beginPath();
        g.moveTo(115 + i * 58, y);
        g.lineTo(1085 - i * 58, y);
        g.strokePath();
      }

      this.add.rectangle(this.vanish.x, this.vanish.y, 10, 10, 0xc7f43a, 0.8).setAngle(45);
    }

    throwBall() {
      if (gameState.busy) return;
      if (gameState.energy < 12) {
        setStatus("Resting", "Daisy needs a tiny recharge before the next sprint.");
        this.restDaisy();
        return;
      }

      gameState.busy = true;
      gameState.energy = Math.max(0, gameState.energy - 14);
      updateHud();
      setStatus("Fetching", "Ball launched into deep space. Daisy is on it.");
      this.statusText.setText("FETCH VECTOR LOCKED");

      this.tweens.killTweensOf([this.daisy, this.ball, this.shadow]);
      this.trail.clear();
      this.ball.setPosition(790, 348).setScale(1).setAlpha(1);
      this.daisy.setPosition(336, 360).setScale(0.62).setAlpha(1);
      this.daisy.scaleX = 0.62;
      this.shadow.setPosition(336, 392).setScale(1).setAlpha(0.45);

      this.tweens.add({
        targets: this.ball,
        x: this.vanish.x + Phaser.Math.Between(-38, 42),
        y: this.vanish.y + Phaser.Math.Between(-8, 24),
        scale: 0.28,
        duration: 780,
        ease: "Cubic.easeOut",
        onUpdate: () => this.drawTrail(),
      });

      this.time.delayedCall(170, () => {
        this.tweens.add({
          targets: this.daisy,
          x: this.ball.x - 14,
          y: this.ball.y + 17,
          scale: 0.23,
          duration: 940,
          ease: "Cubic.easeInOut",
          onUpdate: () => this.followShadow(),
          onComplete: () => this.catchBall(),
        });
      });
    }

    drawTrail() {
      this.trail.clear();
      this.trail.lineStyle(4, 0xc7f43a, 0.3);
      this.trail.beginPath();
      this.trail.moveTo(790, 348);
      this.trail.lineTo(this.ball.x, this.ball.y);
      this.trail.strokePath();
    }

    followShadow() {
      const scale = Math.abs(this.daisy.scaleX || this.daisy.scale || 0.3);
      this.shadow.setPosition(this.daisy.x, this.daisy.y + 36 * scale);
      this.shadow.setScale(Math.max(0.22, scale * 1.15));
      this.shadow.setAlpha(0.12 + scale * 0.45);
    }

    catchBall() {
      setStatus("Returning", "Catch confirmed. Daisy is bringing it back.");
      this.statusText.setText("CATCH CONFIRMED");
      this.ball.setAlpha(0);
      this.daisy.scaleX = -0.23;

      this.time.delayedCall(170, () => {
        this.tweens.add({
          targets: this.daisy,
          x: 336,
          y: 360,
          scale: 0.62,
          duration: 980,
          ease: "Cubic.easeInOut",
          onUpdate: () => this.followShadow(),
          onComplete: () => this.finishFetch(),
        });
      });
    }

    finishFetch() {
      const bonus = gameState.streak * 12;
      gameState.score += 100 + bonus;
      gameState.streak += 1;
      if (gameState.streak % 3 === 0) gameState.treats += 1;
      gameState.highScore = Math.max(gameState.highScore, gameState.score);
      localStorage.setItem("daisy-high-score", String(gameState.highScore));

      gameState.busy = false;
      this.daisy.scaleX = 0.62;
      this.ball.setPosition(790, 348).setScale(1).setAlpha(1);
      this.trail.clear();
      this.statusText.setText("READY FOR NEXT THROW");
      setStatus("Ready", bonus ? `Daisy returned it. Streak bonus: +${bonus}.` : "Daisy returned the ball. Again?");
      updateHud();
    }

    restDaisy() {
      if (gameState.busy && gameState.energy >= 12) return;
      gameState.busy = true;
      this.statusText.setText("RESTING");
      setStatus("Resting", "Daisy is taking a tiny tactical nap.");
      this.time.delayedCall(850, () => {
        gameState.energy = Math.min(100, gameState.energy + 28);
        gameState.busy = false;
        setStatus("Ready", "Daisy popped back up. Ready.");
        updateHud();
      });
    }

    resetRun() {
      gameState.score = 0;
      gameState.streak = 0;
      gameState.energy = 100;
      gameState.treats = 3;
      gameState.busy = false;
      this.tweens.killTweensOf([this.daisy, this.ball, this.shadow]);
      this.daisy.setPosition(336, 360).setScale(0.62);
      this.daisy.scaleX = 0.62;
      this.ball.setPosition(790, 348).setScale(1).setAlpha(1);
      this.shadow.setPosition(336, 392).setScale(1).setAlpha(0.45);
      this.trail.clear();
      setStatus("Ready", "Run reset. Daisy has forgiven us immediately.");
      updateHud();
    }

    update(_time, delta) {
      if (!gameState.busy && gameState.energy < 100) {
        gameState.energy = Math.min(100, gameState.energy + delta * 0.004);
        updateHud();
      }
    }

    shutdown() {
      window.removeEventListener("daisy:throw", this.throwBallBound);
      window.removeEventListener("daisy:rest", this.restBound);
      window.removeEventListener("daisy:reset", this.resetBound);
    }
  }

  new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game",
    width: 1200,
    height: 520,
    transparent: true,
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: DaisyFetchScene,
  });
}

ui.throwButton.addEventListener("click", () => window.dispatchEvent(new Event("daisy:throw")));
ui.restButton.addEventListener("click", () => window.dispatchEvent(new Event("daisy:rest")));
ui.resetButton.addEventListener("click", () => window.dispatchEvent(new Event("daisy:reset")));

createDraggableCards();
updateHud();
bootGame();
