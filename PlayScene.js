export class ScoreSystem {
  constructor() {
    this.score = 0;
    this.streak = 0;
    this.bestStreak = 0;
    this.level = 1;
  }

  catch() {
    this.score += 1;
    this.streak += 1;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    this.level = 1 + Math.floor(this.score / 7);
  }

  miss() {
    this.streak = 0;
  }
}
