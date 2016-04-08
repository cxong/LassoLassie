var Dialog = function(game, group, x, y) {
  Phaser.Sprite.call(this,
                     game,
                     x, y,
                     'dialog');
  this.width *= 2;
  this.height *= 2;
  this.x -= this.width / 2;
  this.y -= this.height / 2;
  this.animations.add('bob', [0, 1], 4, true);
  this.animations.play('bob');

  group.add(this);
};
Dialog.prototype = Object.create(Phaser.Sprite.prototype);
Dialog.prototype.constructor = Dialog;
