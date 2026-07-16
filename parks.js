import { BootScene } from "./scenes/BootScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { PlayScene } from "./scenes/PlayScene.js";
import { ScoreScene } from "./scenes/ScoreScene.js";

const config = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#8fcbd7",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight
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
