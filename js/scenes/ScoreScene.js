export class ScoreScene extends Phaser.Scene {
  constructor() {
    super("ScoreScene");
  }

  init(score) {
    this.score = score;
  }

  create() {
    const panel = document.querySelector("#score-overlay");
    const finalScore = document.querySelector("#final-score");
    const scoreLine = document.querySelector("#score-line");
    const playAgain = document.querySelector("#play-again");

    finalScore.textContent = this.score.score;
    scoreLine.textContent = this.getLine(this.score.score, this.score.bestStreak);
    panel.classList.add("is-active");
    playAgain.onclick = () => {
      panel.classList.remove("is-active");
      this.scene.start("MenuScene");
    };
  }

  getLine(score, streak) {
    if (score <= 2) return "Daisy has filed a formal complaint about throw quality.";
    if (score <= 7) return `Respectable chaos. Best streak: ${streak}.`;
    if (score <= 14) return `Daisy is locked in. Best streak: ${streak}.`;
    return `Elite tennis-ball operations. Best streak: ${streak}.`;
  }
}
