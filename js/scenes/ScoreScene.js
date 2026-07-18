import { audioSystem } from "../systems/AudioSystem.js";

export class ScoreScene extends Phaser.Scene {
  constructor() {
    super("ScoreScene");
  }

  init(score) {
    this.score = score;
  }

  create() {
    audioSystem.setGamePaused(false);
    audioSystem.play("report");
    const panel = document.querySelector("#score-overlay");
    const finalScore = document.querySelector("#final-score");
    const scoreLine = document.querySelector("#score-line");
    const reportPlayer = document.querySelector("#report-player");
    const reportVerdict = document.querySelector("#report-verdict");
    const reportStreak = document.querySelector("#report-streak");
    const reportDate = document.querySelector("#report-date");
    const playAgain = document.querySelector("#play-again");

    finalScore.textContent = this.score.score;
    scoreLine.textContent = this.getLine(this.score.score, this.score.bestStreak);
    reportPlayer.textContent = this.getPlayerName();
    reportVerdict.textContent = this.getVerdict(this.score.score);
    reportStreak.textContent = this.score.bestStreak;
    reportDate.textContent = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(this.score.endedAt));
    panel.classList.add("is-active");
    playAgain.onclick = () => {
      panel.classList.remove("is-active");
      this.scene.start("MenuScene");
    };
  }

  getPlayerName() {
    const name = this.score.player?.name?.trim();
    return name || "Daisy";
  }

  getVerdict(score) {
    if (score <= 2) return "Demanded better.";
    if (score <= 7) return "Stayed ready.";
    if (score <= 14) return "Owned the yard.";
    return "Was unstoppable.";
  }

  getLine(score, streak) {
    if (score <= 2) return "Daisy has filed a formal complaint about throw quality.";
    if (score <= 7) return `Respectable chaos. Best streak: ${streak}.`;
    if (score <= 14) return `Daisy is locked in. Best streak: ${streak}.`;
    return `Elite tennis-ball operations. Best streak: ${streak}.`;
  }
}
