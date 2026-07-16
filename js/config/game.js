export const GAME = {
  world: {
    width: 3600,
    height: 900,
    groundY: 610,
    floorMinY: 560,
    floorMaxY: 780
  },
  daisy: {
    baseSpeed: 385,
    baseAcceleration: 1320,
    turnDrag: 0.91,
    idleDrag: 0.9,
    sprintThreshold: 260,
    catchRadius: 104,
    pounceRadius: 84,
    staminaDrainMove: 0.045,
    staminaDrainSprint: 0.085,
    staminaRecovery: 0.12,
    lowStaminaSpeed: 0.74,
    tiredStopChancePerSecond: 0.04,
    tiredStopSeconds: 0.8,
    catchAnimationMs: 260
  },
  ball: {
    gravity: 1180,
    launchVelocityX: 560,
    launchVelocityY: -640,
    minLaunchVelocityX: 430,
    maxLaunchVelocityX: 720,
    minLaunchVelocityY: -760,
    maxLaunchVelocityY: -520,
    bounceDamping: 0.54,
    bounceHorizontalDamping: 0.76,
    rollDrag: 0.978,
    stopSpeed: 28,
    spinDecay: 0.965,
    lifeSeconds: 8.5
  },
  throws: {
    firstDelay: 650,
    waveDelay: 1050,
    maxActiveBalls: 1,
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
    ignoreTopPixels: 92
  },
  render: {
    daisyWidth: 238,
    daisyHeight: 258,
    ballSize: 52
  },
  api: {
    webhookUrl: ""
  }
};
