var Player = function(
  game, group, bulletGroup, hitGroup, lassoGroup,
  bgGroup,
  x, y, soundStrings) {
  Phaser.Sprite.call(this, game, x, y, 'lassie');
  group.add(this);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.collideWorldBounds = true;
  // Slightly smaller body
  this.body.setSize(16, 16);
  this.anchor.setTo(0.5);
  this.speed = 60;
  // animations
  this.animations.add('lasso', [0, 1, 2, 3], 20, false);
  this.animations.add('fire', [4, 5, 6, 7], 20, false);
  this.animations.add(
    'run_left', [8, 9, 10, 11], 20, true
  );
  this.animations.add(
    'run_right', [12, 13, 14, 15], 20, true
  );
  this.animations.add('run', [16, 17, 18, 19], 10, true);
  this.animations.add('idle', [24], 1, true);
  this.animations.play('idle');

  this.sounds = {
    lasso_in: game.add.audio('lasso_in'),
    lasso_out: game.add.audio('lasso_out'),
    shoot: game.add.audio('shoot')
  };

  this.crosshair = game.make.sprite(0, -60, 'crosshair');
  game.physics.enable(
    this.crosshair, Phaser.Physics.ARCADE);
  this.crosshair.anchor.setTo(0.5);
  this.crosshair.body.setSize(1, 1);
  this.addChild(this.crosshair);

  // When firing, the player is frozen for a bit
  this.fireCounter = 0;
  this.FIRE_DURATION_TOTAL = 800;
  this.LASSO_DURATION_TOTAL = 1300;
  this.FIRE_FREEZE_DURATION = 300;
  this.BULLET_LIFESPAN = 320;
  this.BULLET_DY = 180;

  this.invincibilityCounter = 2000;

  this.game = game;
  this.hitGroup = hitGroup;
  this.bulletGroup = bulletGroup;
  this.lassoGroup = lassoGroup;
  this.bgGroup = bgGroup;
};
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.move = function(dx, dy) {
  if (this.fireCounter > this.FIRE_FREEZE_DURATION) {
    return;
  }
  if (!this.alive) {
    return;
  }
  if (dx === 0 && dy === 0) {
    this.animations.play('idle');
    this.body.velocity.setTo(0);
  } else {
    this.body.velocity.setTo(dx * this.speed, dy * this.speed);
    if (dx > 0) {
      this.animations.play('run_right');
    } else if (dx < 0) {
      this.animations.play('run_left');
    } else {
      this.animations.play('run');
    }
  }
};

Player.prototype.fire = function() {
  if (this.fireCounter > 0) {
    return;
  }
  if (!this.alive) {
    return;
  }
  new Bullet(
    this.game, this.bulletGroup, this.hitGroup,
    this.BULLET_LIFESPAN,
    'player_bullet', 'player_explosion',
    this.x, this.y, 0, -this.BULLET_DY
  );
  this.fireCounter = this.FIRE_DURATION_TOTAL;
  this.animations.play('fire');
  this.body.velocity.setTo(0);
  this.sounds.shoot.play();
};

Player.prototype.lasso = function() {
  if (this.fireCounter > 0) {
    return;
  }
  if (!this.alive) {
    return;
  }
  new Lasso(
    this.game, this.bulletGroup, this.lassoGroup,
    this.x, this.y, this.sounds.lasso_in
  );
  this.fireCounter = this.LASSO_DURATION_TOTAL;
  this.animations.play('lasso');
  this.body.velocity.setTo(0);
  this.sounds.lasso_out.play();
};

Player.prototype.update = function() {
  if (this.invincibilityCounter > 0) {
    this.invincibilityCounter -= this.game.time.elapsed;
    // Blink when invincible
    this.visible = this.invincibilityCounter / 4 % 4 > 1;
  } else {
    this.visible = this.alive;
  }

  if (this.fireCounter > 0) {
    this.fireCounter -= this.game.time.elapsed;
  }
};

Player.prototype.killAndLeaveCorpse = function() {
  this.kill();
  // Leave a limited corpse on the background layer
  var corpse = this.game.make.sprite(
    this.x, this.y, this.key);
  corpse.anchor.setTo(0.5);
  corpse.animations.add(
    'die', [20, 21, 22, 23], 4, false
  );
  corpse.animations.play('die');
  corpse.lifespan = 1000;
  this.bgGroup.add(corpse);
};
