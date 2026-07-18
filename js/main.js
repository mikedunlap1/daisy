import { BootScene } from "./scenes/BootScene.js?v=20260718-4";
import { MenuScene } from "./scenes/MenuScene.js?v=20260718-3";
import { PlayScene } from "./scenes/PlayScene.js?v=20260718-11";
import { ScoreScene } from "./scenes/ScoreScene.js?v=20260718-2";
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
