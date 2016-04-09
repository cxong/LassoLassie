var Player = function(
  game, group, bulletGroup, hitGroup,
  x, y, soundStrings) {
  Phaser.Sprite.call(this, game, x, y, 'lassie');
  group.add(this);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.collideWorldBounds = true;
  this.anchor.setTo(0.5);
  this.speed = 60;
  // TODO: check body
  // TODO: animations
  //this.animations.add('bob', [0, 1], 4, true);
  //this.animations.play('bob');

  this.crosshair = game.make.sprite(0, -60, 'crosshair');
  game.physics.enable(
    this.crosshair, Phaser.Physics.ARCADE);
  this.crosshair.anchor.setTo(0.5);
  this.crosshair.body.setSize(1, 1);
  this.addChild(this.crosshair);

  // When firing, the player is frozen for a bit
  this.fireCounter = 0;
  this.FIRE_DURATION_TOTAL = 500;
  this.FIRE_FREEZE_DURATION = 300;
  this.BULLET_LIFESPAN = 200;
  this.bulletReady = false;
  this.bulletHasHit = false;

  this.sounds = soundStrings.map(function(str) {
    return {str: str, sound: game.add.audio(str)};
  });
  this.game = game;
  this.hitGroup = hitGroup;
  this.bulletGroup = bulletGroup;
};
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.move = function(dx, dy) {
  if (this.fireCounter > this.FIRE_FREEZE_DURATION) {
    return;
  }
  if (dx === 0 && dy === 0) {
    // TODO: idle animation
    this.body.velocity.setTo(0);
  } else {
    this.body.velocity.setTo(dx * this.speed, dy * this.speed);
    // TODO: walking animation
  }
};

Player.prototype.fire = function() {
  if (this.fireCounter > 0) {
    return;
  }
  new Bullet(
    this.game, this.bulletGroup, this.hitGroup,
    this.BULLET_LIFESPAN,
    'player_bullet', 'player_explosion',
    this.x, this.y, 0, -300
  );
  this.fireCounter = this.FIRE_DURATION_TOTAL;
  this.bulletReady = false;
  this.bulletHasHit = false;
  // TODO: firing animation
  this.body.velocity.setTo(0);
};

Player.prototype.update = function() {
  if (this.fireCounter > 0) {
    this.fireCounter -= this.game.time.elapsed;
    if (this.fireCounter < this.FIRE_DURATION_TOTAL - this.BULLET_LIFESPAN) {
      if (!this.bulletHasHit && !this.bulletReady) {
        this.bulletReady = true;
      } else {
        this.bulletHasHit = true;
      }
    }
  }
};

Player.prototype.canHit = function() {
  return this.bulletReady && !this.bulletHasHit;
};
