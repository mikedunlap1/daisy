export const GAME = {
  world: {
    width: 3600,
    height: 900,
    groundY: 610,
    floorMinY: 560,
    floorMaxY: 780
  },
  daisy: {
    baseSpeed: 330,
    baseAcceleration: 980,
    turnDrag: 0.88,
    idleDrag: 0.93,
    sprintThreshold: 260,
    catchRadius: 58,
    pounceRadius: 84,
    staminaDrainMove: 0.115,
    staminaDrainSprint: 0.17,
    staminaRecovery: 0.055,
    lowStaminaSpeed: 0.62,
    tiredStopChancePerSecond: 0.13,
    tiredStopSeconds: 0.8,
    catchAnimationMs: 260
  },
  ball: {
    gravity: 1420,
    launchVelocityX: 760,
    launchVelocityY: -820,
    minLaunchVelocityX: 540,
    maxLaunchVelocityX: 1160,
    minLaunchVelocityY: -980,
    maxLaunchVelocityY: -520,
    bounceDamping: 0.56,
    bounceHorizontalDamping: 0.82,
    rollDrag: 0.985,
    stopSpeed: 38,
    spinDecay: 0.965,
    lifeSeconds: 9.5
  },
  throws: {
    firstDelay: 900,
    waveDelay: 1350,
    maxActiveBalls: 4,
    chuckitVisibleMs: 520
  },
  levels: {
    roundSeconds: 45,
    ballsPerWave: 1,
    launchSpeedGrowth: 1.08,
    bounceChaosGrowth: 1.05,
    levelEveryCatches: 7
  },
  camera: {
    lerp: 0.085,
    leadX: 170,
    leadY: 36,
    zoomFast: 0.985,
    zoomNormal: 1.04
  },
  controls: {
    touchStickRadius: 55,
    ignoreTopPixels: 120
  },
  render: {
    daisyWidth: 190,
    daisyHeight: 152,
    ballSize: 38
  },
  api: {
    webhookUrl: ""
  }
};
