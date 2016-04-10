var LASSO_DY = 100;
var LASSO_LIFESPAN = 600;

// Lasso is a series of sprites that models the lifetime
// of the lasso. The first stage is the travel, which
// leaves a lasso "hit". The hit can collide with targets.
// Finally the lasso returns, optionally pulling targets
// back in
var Lasso = function(
  game, group, hitGroup, x, y, inSound) {
  Phaser.Sprite.call(this, game, x, y, 'lasso');
  group.add(this);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.velocity.setTo(0, -LASSO_DY);
  this.velocityReturn = new Phaser.Point(0, LASSO_DY);
  this.anchor.setTo(0.5);
  this.lifespan = LASSO_LIFESPAN;
  this.lifespanSave = LASSO_LIFESPAN;
  this.reversed = false;

  // Add a rope that stretches from this
  this.rope = game.make.sprite(9, 10, 'rope');
  this.rope.anchor.setTo(0.5, 1);
  this.rope.scale.setTo(1, -1);
  this.yStart = y;
  this.addChild(this.rope);

  this.exploded = false;
  this.hitGroup = hitGroup;
  this.game = game;
  this.inSound = inSound;
};
Lasso.prototype = Object.create(Phaser.Sprite.prototype);
Lasso.prototype.constructor = Lasso;

Lasso.prototype.update = function() {
  if (!this.alive && !this.reversed) {
    // Leave an explosion and return
    this.reversed = true;
    this.inSound.play();
    this.lifespan = this.lifespanSave;
    this.reset(this.x, this.y);
    this.body.velocity = this.velocityReturn;
    var hit = this.game.make.sprite(
      this.x, this.y, 'lasso_hit'
    );
    this.game.physics.enable(hit, Phaser.Physics.ARCADE);
    hit.anchor.setTo(0.5);
    hit.lifespan = 100;
    this.hitGroup.add(hit);
  }
  // Stretch the rope
  this.rope.scale.setTo(
    1, Math.min(1, this.y - this.yStart + 10)
  );
};
