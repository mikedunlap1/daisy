# Daisy Ball Chase

A static Phaser 3 arcade game where Daisy steers into chaotic tennis balls launched by an off-screen blue Chuckit.

## Run Locally

Serve the folder with any static server:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## File Structure

```text
/index.html
/css/
/js/
  main.js
  scenes/
  config/
  systems/
  data/api.js
/assets/
  daisies/
  parks/
  props/
```

`main.js` only boots Phaser and registers scenes. Game content lives in config files. Gameplay behavior lives in small systems.

## Add a Daisy Variant

Edit `js/config/daisies.js` and append a new object:

```js
{
  id: "new-daisy",
  name: "New Daisy",
  blurb: "A very specific personality issue.",
  stats: { speed: 1, acceleration: 1, turnRadius: 1, stamina: 1, focus: 1 },
  sprite: "daisy",
  idleAnimation: "sassy-idle"
}
```

The start screen renders cards from this array automatically.

## Add a Park

Create a folder under `assets/parks/your-park/` with:

```text
sky.png
far.png
mid.png
near.png
ground.png
foreground.png
preview.png
```

Then append a park object in `js/config/parks.js`. The parallax system reads the layer map and parallax values from config.

## Tune Physics

Edit `js/config/game.js`.

Useful knobs:

- `ball.launchVelocityX`
- `ball.gravity`
- `ball.bounceDamping`
- `ball.rollDrag`
- `daisy.baseSpeed`
- `daisy.baseAcceleration`
- `camera.lerp`
- `throws.maxActiveBalls`
- `levels.roundSeconds`

No gameplay tuning numbers should live inside scenes.

## Wire n8n / Airtable

All network access goes through `js/data/api.js`.

Set `GAME.api.webhookUrl` in `js/config/game.js` to your n8n webhook URL. The browser never receives an Airtable key. If the webhook is empty or offline, the game keeps working and score submission fails silently with a console warning.

Expected score payload shape:

```json
{
  "type": "score_submit",
  "payload": {
    "player": { "id": "local-id", "name": "Michael", "authProvider": "local" },
    "daisyId": "sassy",
    "parkId": "north-park",
    "score": 12,
    "bestStreak": 5,
    "endedAt": "2026-07-16T00:00:00.000Z"
  }
}
```

## Deploy to Render

Create a Render Static Site pointed at this repo/folder.

- Build command: leave blank
- Publish directory: `.`
- No environment variables are required for the client

## Assumptions and Pushbacks

- I used generated first-pass art because the workspace only had the two reference images, not Daisy photos.
- The two real parks are named North Park and South Park as placeholders. Swap names/assets in `parks.js` if you mean different parks.
- Returning the ball is treated as a between-round animation idea, not the core loop. The core fun is steering Daisy into fast, bouncy balls.
- Phaser Arcade Physics is enough here. Matter would only be justified for complex terrain collision, which this game does not need.
- The current sprite sheet is intentionally simple and documented so it can be redrawn without changing game code.
