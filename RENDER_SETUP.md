# Daisy Fetch Game Render Setup

This version is a static Phaser game.

## Simple static deploy

If Render is serving files directly from the repository root, no build command is needed.

## Static site with build command

Use:

```bash
npm install && npm run build
```

Publish directory:

```text
dist
```

The game loads Phaser from jsDelivr in `index.html`.
