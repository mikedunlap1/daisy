const TRACKS = {
  gameplay: { src: "./assets/audio/backyard-ambience.mp3", volume: 0.2, loop: true },
  report: { src: "./assets/audio/daisy-report-cue.mp3", volume: 0.32, loop: true }
};

class AudioSystem {
  constructor() {
    this.muted = localStorage.getItem("daisy-muted") !== "false";
    this.currentName = null;
    this.pausedByGame = false;
    this.fadeToken = 0;
    this.tracks = Object.fromEntries(Object.entries(TRACKS).map(([name, config]) => {
      const audio = new Audio(config.src);
      audio.loop = config.loop;
      audio.preload = "auto";
      audio.volume = 0;
      return [name, { audio, volume: config.volume }];
    }));
    this.button = document.querySelector("#mute-toggle");
    this.button?.addEventListener("click", () => this.setMuted(!this.muted));
    this.paintButton();
  }

  play(name) {
    if (!this.tracks[name]) return;
    this.currentName = name;
    Object.entries(this.tracks).forEach(([trackName, { audio }]) => {
      if (trackName !== name) {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0;
      }
    });
    if (!this.muted && !this.pausedByGame) this.fadeCurrentToTarget();
  }

  stop() {
    this.fadeToken += 1;
    this.currentName = null;
    Object.values(this.tracks).forEach(({ audio }) => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    });
  }

  setMuted(muted) {
    this.muted = muted;
    localStorage.setItem("daisy-muted", String(muted));
    this.paintButton();
    if (muted) this.pauseCurrent();
    else if (!this.pausedByGame) this.fadeCurrentToTarget();
  }

  setGamePaused(paused) {
    this.pausedByGame = paused;
    if (paused) this.pauseCurrent();
    else if (!this.muted) this.fadeCurrentToTarget();
  }

  pauseCurrent() {
    this.fadeToken += 1;
    const track = this.tracks[this.currentName];
    if (!track) return;
    track.audio.pause();
    track.audio.volume = 0;
  }

  fadeCurrentToTarget() {
    const track = this.tracks[this.currentName];
    if (!track) return;
    const token = ++this.fadeToken;
    track.audio.volume = 0;
    track.audio.play().catch(() => {});
    const startedAt = performance.now();
    const tick = (now) => {
      if (token !== this.fadeToken || this.muted || this.pausedByGame) return;
      const progress = Math.min(1, (now - startedAt) / 700);
      track.audio.volume = track.volume * progress;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  paintButton() {
    if (!this.button) return;
    this.button.textContent = this.muted ? "Muted" : "Sound On";
    this.button.setAttribute("aria-pressed", String(this.muted));
  }
}

export const audioSystem = new AudioSystem();
