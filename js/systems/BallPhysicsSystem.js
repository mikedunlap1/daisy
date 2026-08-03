import { GAME } from "../config/game.js";

export class BallPhysicsSystem {
  constructor(scene, group) {
    this.scene = scene;
    this.group = group;
  }

  launch({ x, y, vx, vy, level = 1 }) {
    const shadow = this.scene.add.ellipse(
      x,
      y + 20,
      GAME.render.ballShadowWidth,
      GAME.render.ballShadowHeight,
      0x102416,
      0.26
    ).setDepth(8);
    const ball = this.scene.physics.add.sprite(x, y, "tennis-ball").setDepth(9);
    ball.setDisplaySize(GAME.render.ballSize, GAME.render.ballSize);
    ball.body.setAllowGravity(false);
    const glow = this.scene.add.circle(x, y, GAME.render.ballSize * 0.72, 0xd8ff55, 0)
      .setStrokeStyle(5, 0xf5ff9c, 0)
      .setDepth(12);
    glow.setBlendMode(Phaser.BlendModes.SCREEN);
    const collisionDiameter = ball.width * 0.72;
    ball.body.setCircle(collisionDiameter / 2, (ball.width - collisionDiameter) / 2, (ball.height - collisionDiameter) / 2);
    ball.flightData = {
      height: 0,
      zVelocity: vy,
      spin: Phaser.Math.Between(-18, 18),
      age: 0,
      caught: false,
      shadow,
      glow,
      baseY: y,
      level,
      baseScale: ball.scaleX,
      impact: 0
    };
    this.group.add(ball);
    // PhysicsGroup applies its defaults when a member is added, so set launch
    // velocity afterwards or the ball is reset to a stationary object.
    ball.setVelocity(vx, Phaser.Math.Between(-22, 44));
    return ball;
  }

  update(delta, park) {
    const dt = delta / 1000;
    this.group.getChildren().forEach((ball) => {
      const data = ball.flightData;
      if (!data) return;
      data.age += dt;
      data.zVelocity += GAME.ball.gravity * dt;
      data.height += data.zVelocity * dt;
      data.baseY += ball.body.velocity.y * dt;

      if (data.height > 0) {
        data.height = 0;
        data.zVelocity *= -GAME.ball.bounceDamping;
        ball.body.velocity.x *= GAME.ball.bounceHorizontalDamping;
        ball.body.velocity.y *= GAME.ball.bounceHorizontalDamping;
        data.impact = 1;
        if (Math.abs(data.zVelocity) < 120) data.zVelocity = 0;
      }

      const rolling = data.height === 0 && data.zVelocity === 0;
      if (rolling) {
        ball.body.velocity.x *= GAME.ball.rollDrag * park.groundFriction;
        ball.body.velocity.y *= GAME.ball.rollDrag * park.groundFriction;
      }

      data.spin *= GAME.ball.spinDecay;
      data.impact *= GAME.render.ballImpactRecovery;
      ball.rotation = 0;
      data.baseY = Phaser.Math.Clamp(data.baseY, GAME.world.floorMinY - 20, GAME.world.floorMaxY + 20);
      ball.y = data.baseY + data.height * 0.22;
      const heightScale = Phaser.Math.Clamp(
        GAME.render.ballMinScale + Math.abs(data.height) / GAME.render.ballHeightScale,
        GAME.render.ballMinScale,
        GAME.render.ballMaxScale
      );
      ball.setScale(
        data.baseScale * heightScale * (1 + data.impact * GAME.render.ballImpactSquashX),
        data.baseScale * heightScale * (1 - data.impact * GAME.render.ballImpactSquashY)
      );
      ball.setDepth(10 + Math.floor(ball.y / 16));

      data.shadow.x = ball.x;
      data.shadow.y = data.baseY + 28;
      data.shadow.scaleX = Phaser.Math.Clamp(1 - Math.abs(data.height) / 900, 0.35, 1.1);
      data.shadow.scaleY = data.shadow.scaleX;
      data.shadow.alpha = Phaser.Math.Clamp(0.28 - Math.abs(data.height) / 1600, 0.08, 0.28);
      data.glow.x = ball.x;
      data.glow.y = ball.y;
      data.glow.setDepth(ball.depth + 1);
      const ageWarning = Phaser.Math.Clamp((data.age - (GAME.ball.lifeSeconds - 6.5)) / 6.5, 0, 1);
      const rollWarning = rolling ? Phaser.Math.Clamp((GAME.ball.stopSpeed * 5 - ball.body.speed) / (GAME.ball.stopSpeed * 5), 0, 1) : 0;
      const warning = Math.max(ageWarning, rollWarning);
      const pulse = 0.55 + Math.sin(data.age * 12) * 0.45;
      data.glow.alpha = warning * (0.28 + pulse * 0.56);
      data.glow.setStrokeStyle(6 + warning * 5, 0xf5ff9c, warning * (0.46 + pulse * 0.5));
      data.glow.scale = heightScale * (1.12 + warning * (0.58 + pulse * 0.42));
      if (warning > 0.05) ball.setTint(0xf3ff74);
      else ball.clearTint();

      if (data.age > GAME.ball.lifeSeconds || (rolling && ball.body.speed < GAME.ball.stopSpeed)) {
        this.scene.scoreSystem?.miss();
        data.shadow.destroy();
        data.glow.destroy();
        ball.clearTint();
        ball.destroy();
      }
    });
  }
}
