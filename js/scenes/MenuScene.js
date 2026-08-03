import { DAISIES } from "../config/daisies.js";
import { PARKS } from "../config/parks.js";
import { loadSettings, saveSettings } from "../systems/StorageSystem.js";
import { getLocalPlayer, startSession } from "../data/api.js";
import { audioSystem } from "../systems/AudioSystem.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  create() {
    audioSystem.stop();
    [
      { key: "park-sky", alpha: 1 },
      { key: "park-far", alpha: 0.75 },
      { key: "park-near", alpha: 1 }
    ].forEach(({ key, alpha }) => {
      this.add.image(0, 0, key)
        .setOrigin(0, 0)
        .setDisplaySize(this.scale.width, this.scale.height)
        .setScrollFactor(0)
        .setAlpha(alpha);
    });
    this.renderDom();
  }

  renderDom() {
    const defaults = { daisyId: DAISIES[0].id, parkId: PARKS[0].id, playerName: "" };
    const settings = loadSettings(defaults);
    const menu = document.querySelector("#menu-overlay");
    const score = document.querySelector("#score-overlay");
    const hud = document.querySelector("#hud");
    const nameInput = document.querySelector("#player-name");
    const start = document.querySelector("#start-game");
    const daisyCards = document.querySelector("#daisy-cards");
    menu.classList.add("is-active");
    score.classList.remove("is-active");
    hud.classList.remove("is-active");
    document.querySelector("#pause-overlay").classList.remove("is-active");
    document.querySelector("#pause-toggle").classList.remove("is-active");
    nameInput.value = settings.playerName || "";

    let selectedDaisy = DAISIES.some((daisy) => daisy.id === settings.daisyId) ? settings.daisyId : DAISIES[0].id;
    let selectedPark = PARKS.some((park) => park.id === settings.parkId) ? settings.parkId : PARKS[0].id;

    const paintSelections = () => {
      document.querySelectorAll("[data-daisy-id]").forEach((card) => card.classList.toggle("is-selected", card.dataset.daisyId === selectedDaisy));
      menu.dataset.daisy = selectedDaisy;
    };

    daisyCards.innerHTML = DAISIES.map((daisy) => `
      <button class="select-card" type="button" data-daisy-id="${daisy.id}">
        <span class="card-sprite css-daisy" aria-hidden="true"></span>
        <h3>${daisy.name}</h3>
        <p>${daisy.blurb}</p>
        <div class="stat-bars">
          ${Object.entries(daisy.stats).map(([label, value]) => `
            <span class="stat-row"><span>${label}</span><i style="width:${Math.round(value * 62)}%"></i></span>
          `).join("")}
        </div>
      </button>
    `).join("");

    daisyCards.onclick = (event) => {
      const card = event.target.closest("[data-daisy-id]");
      if (!card) return;
      selectedDaisy = card.dataset.daisyId;
      paintSelections();
    };

    start.onclick = async () => {
      const nextSettings = { daisyId: selectedDaisy, parkId: selectedPark, playerName: nameInput.value.trim() };
      saveSettings(nextSettings);
      const player = getLocalPlayer(nextSettings.playerName);
      startSession(player);
      menu.classList.remove("is-active");
      nameInput.blur();
      this.scene.start("PlayScene", { ...nextSettings, player });
    };

    paintSelections();
  }
}
