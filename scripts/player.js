var Player = function(game, x, y, soundStrings) {
  Phaser.Sprite.call(this,
                     game,
                     x, y,
                     'lassie');
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.collideWorldBounds = true;
  this.speed = 100;
  // TODO: check body
  // TODO: animations
  //this.animations.add('bob', [0, 1], 4, true);
  //this.animations.play('bob');

  this.sounds = soundStrings.map(function(str) {
    return {str: str, sound: game.add.audio(str)};
  });
  this.game = game;
};
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.move = function(dx, dy) {
  if (dx === 0 && dy === 0) {
    // TODO: idle animation
    this.body.velocity.setTo(0);
  } else {
    this.body.velocity.setTo(dx * this.speed, dy * this.speed);
    // TODO: walking animation
  }
};

Player.prototype.update = function() {
};
