#app-shell {
  position: relative;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  isolation: isolate;
}

#game,
#game canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

#game canvas {
  display: block;
}

.screen-panel {
  position: absolute;
  inset: clamp(12px, 2vw, 28px);
  z-index: 5;
  display: none;
  overflow: auto;
  max-width: 1180px;
  margin: 0 auto;
  padding: clamp(18px, 3vw, 34px);
  border: 1px solid var(--line);
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 253, 239, 0.94), rgba(255, 245, 222, 0.84));
  box-shadow: var(--shadow);
  backdrop-filter: blur(16px) saturate(1.1);
}

.screen-panel.is-active {
  display: block;
  animation: panel-in 280ms ease both;
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
