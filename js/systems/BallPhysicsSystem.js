import { GAME } from "../config/game.js";

export class BallPhysicsSystem {
  constructor(scene, group) {
    this.scene = scene;
    this.group = group;
  }

  launch({ x, y, vx, vy, level = 1 }) {
    const shadow = this.scene.add.ellipse(x, y + 24, 58, 18, 0x102416, 0.3).setDepth(8);
    const ball = this.scene.physics.add.sprite(x, y, "tennis-ball").setDepth(9);
    ball.setDisplaySize(GAME.render.ballSize, GAME.render.ballSize);
    ball.body.setAllowGravity(false);
    ball.body.setCircle(36, 12, 12);
    ball.data = {
      height: 0,
      zVelocity: vy,
      spin: Phaser.Math.Between(-18, 18),
      age: 0,
      caught: false,
      shadow,
      baseY: y,
      level
    };
    ball.setVelocity(vx, Phaser.Math.Between(-22, 44));
    this.group.add(ball);
    return ball;
  }

  update(delta, park) {
    const dt = delta / 1000;
    this.group.getChildren().forEach((ball) => {
      const data = ball.data;
      data.age += dt;
      data.zVelocity += GAME.ball.gravity * dt;
      data.height += data.zVelocity * dt;
      data.baseY += ball.body.velocity.y * dt;

      if (data.height > 0) {
        data.height = 0;
        data.zVelocity *= -GAME.ball.bounceDamping;
        ball.body.velocity.x *= GAME.ball.bounceHorizontalDamping;
        ball.body.velocity.y *= GAME.ball.bounceHorizontalDamping;
        if (Math.abs(data.zVelocity) < 120) data.zVelocity = 0;
      }

      const rolling = data.height === 0 && data.zVelocity === 0;
      if (rolling) {
        ball.body.velocity.x *= GAME.ball.rollDrag * park.groundFriction;
        ball.body.velocity.y *= GAME.ball.rollDrag * park.groundFriction;
      }

      data.spin *= GAME.ball.spinDecay;
      ball.rotation += data.spin * dt;
      data.baseY = Phaser.Math.Clamp(data.baseY, GAME.world.floorMinY - 20, GAME.world.floorMaxY + 20);
      ball.y = data.baseY + data.height * 0.22;
      ball.setScale(Phaser.Math.Clamp(0.55 + Math.abs(data.height) / 1250, 0.5, 0.78));
      ball.setDepth(10 + Math.floor(ball.y / 16));

      data.shadow.x = ball.x;
      data.shadow.y = data.baseY + 28;
      data.shadow.scaleX = Phaser.Math.Clamp(1 - Math.abs(data.height) / 900, 0.35, 1.1);
      data.shadow.scaleY = data.shadow.scaleX;
      data.shadow.alpha = Phaser.Math.Clamp(0.28 - Math.abs(data.height) / 1600, 0.08, 0.28);

      if (data.age > GAME.ball.lifeSeconds || (rolling && ball.body.speed < GAME.ball.stopSpeed)) {
        this.scene.scoreSystem?.miss();
        data.shadow.destroy();
        ball.destroy();
      }
    });
  }
}
