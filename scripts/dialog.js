var Dialog = function(game, group, x, y) {
  Phaser.Sprite.call(this,
                     game,
                     x, y,
                     'dialog');
  this.animations.add('bob', [0, 1], 2, true);
  this.animations.play('bob');

  group.add(this);
};
Dialog.prototype = Object.create(Phaser.Sprite.prototype);
Dialog.prototype.constructor = Dialog;
