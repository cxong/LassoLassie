// Bullet has a limited lifespan, leaving an explosion
// at the end. The explosion is the one that hits targets
var Bullet = function(
  game, group, hitGroup, lifespan,
  sprite, explosionSprite, x, y, dx, dy) {
  Phaser.Sprite.call(this, game, x, y, sprite);
  group.add(this);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.velocity.setTo(dx, dy);
  this.anchor.setTo(0.5);
  this.lifespan = lifespan;
  this.exploded = false;
  this.hitGroup = hitGroup;
  this.explosionSprite = explosionSprite;
  this.game = game;
};
Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

Bullet.prototype.update = function() {
  if (!this.alive && !this.exploded) {
    // Leave an explosion
    this.exploded = true;
    var explosion = this.game.make.sprite(
      this.x, this.y, this.explosionSprite
    );
    this.game.physics.enable(
      explosion, Phaser.Physics.ARCADE
    );
    explosion.anchor.setTo(0.5);
    explosion.lifespan = 100;
    this.hitGroup.add(explosion);
  }
};
