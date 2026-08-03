import { BootScene } from "./scenes/BootScene.js?v=20260802-5";
import { MenuScene } from "./scenes/MenuScene.js?v=20260802-2";
import { PlayScene } from "./scenes/PlayScene.js?v=20260802-4";
import { ScoreScene } from "./scenes/ScoreScene.js?v=20260802-4";
import { GAME } from "./config/game.js";

const config = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#8fcbd7",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: Math.min(window.innerWidth, GAME.viewport.desktopMaxWidth),
    height: Math.min(window.innerHeight, GAME.viewport.desktopMaxHeight),
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    }
  },
  scene: [BootScene, MenuScene, PlayScene, ScoreScene]
};

window.DAISY_GAME = new Phaser.Game(config);
