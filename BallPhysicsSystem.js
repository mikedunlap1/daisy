:root {
  color-scheme: light;
  --ink: #1d241f;
  --muted: #5f6d63;
  --panel: rgba(255, 252, 238, 0.9);
  --panel-strong: rgba(255, 250, 230, 0.96);
  --line: rgba(64, 74, 56, 0.18);
  --blue: #1b68d8;
  --green: #bde841;
  --shadow: 0 18px 46px rgba(50, 42, 27, 0.22);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: #9dccd4;
  color: var(--ink);
}

body {
  overscroll-behavior: none;
  touch-action: none;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}
