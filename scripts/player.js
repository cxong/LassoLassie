var Player = function(
  game, group, bulletGroup, hitGroup, lassoGroup,
  x, y, soundStrings) {
  Phaser.Sprite.call(this, game, x, y, 'lassie');
  group.add(this);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.collideWorldBounds = true;
  // Slightly smaller body
  this.body.setSize(16, 16);
  this.anchor.setTo(0.5);
  this.speed = 60;
  // TODO: check body
  // TODO: animations
  //this.animations.add('bob', [0, 1], 4, true);
  //this.animations.play('bob');

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
  this.FIRE_DURATION_TOTAL = 500;
  this.LASSO_DURATION_TOTAL = 1000;
  this.FIRE_FREEZE_DURATION = 300;
  this.BULLET_LIFESPAN = 200;

  this.invincibilityCounter = 2000;

  this.game = game;
  this.hitGroup = hitGroup;
  this.bulletGroup = bulletGroup;
  this.lassoGroup = lassoGroup;
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
  if (!this.alive) {
    return;
  }
  new Bullet(
    this.game, this.bulletGroup, this.hitGroup,
    this.BULLET_LIFESPAN,
    'player_bullet', 'player_explosion',
    this.x, this.y, 0, -300
  );
  this.fireCounter = this.FIRE_DURATION_TOTAL;
  // TODO: firing animation
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
  // TODO: lasso animation
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
  // TODO: die animation
  this.kill();
};
