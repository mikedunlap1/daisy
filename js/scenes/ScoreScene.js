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
    reportPlayer.textContent = "Daisy";
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
      this.scene.start("PlayScene", {
        player: this.score.player,
        daisyId: this.score.daisyId,
        parkId: this.score.parkId
      });
    };
  }

  getVerdict(score) {
    if (score <= 2) return Phaser.Utils.Array.GetRandom([
      "demanded better.",
      "questioned the throws.",
      "kept her standards."
    ]);
    if (score <= 7) return Phaser.Utils.Array.GetRandom([
      "stayed ready.",
      "found her rhythm.",
      "worked the yard."
    ]);
    if (score <= 14) return Phaser.Utils.Array.GetRandom([
      "owned the yard.",
      "locked onto fuzz.",
      "ran the field."
    ]);
    return Phaser.Utils.Array.GetRandom([
      "was unstoppable.",
      "became backyard legend.",
      "ruled the tennis balls."
    ]);
  }

  getLine(score, streak) {
    if (score <= 2) return Phaser.Utils.Array.GetRandom([
      `Daisy has filed a formal complaint about throw quality. Best streak: ${streak}.`,
      `Daisy is reviewing the footage with concern. Best streak: ${streak}.`,
      `Daisy warmed up, judged everyone, and saved energy. Best streak: ${streak}.`
    ]);
    if (score <= 7) return Phaser.Utils.Array.GetRandom([
      `Daisy found a little chaos and made it respectable. Best streak: ${streak}.`,
      `Daisy kept the backyard honest. Best streak: ${streak}.`,
      `Daisy caught enough to keep the family scoreboard interesting. Best streak: ${streak}.`
    ]);
    if (score <= 14) return Phaser.Utils.Array.GetRandom([
      `Daisy got locked in and started reading the bounces. Best streak: ${streak}.`,
      `Daisy turned the yard into a tennis-ball operation. Best streak: ${streak}.`,
      `Daisy chased like the bragging rights were legally binding. Best streak: ${streak}.`
    ]);
    return Phaser.Utils.Array.GetRandom([
      `Daisy delivered elite backyard tennis-ball work. Best streak: ${streak}.`,
      `Daisy left no fuzz uninvestigated. Best streak: ${streak}.`,
      `Daisy made the yard hers and the tennis balls nervous. Best streak: ${streak}.`
    ]);
  }
}
