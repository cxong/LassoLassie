var EnemyTypes = {
  outlaw: {
    name: 'outlaw',
    speed: 30
  }
};

var Enemy = function(
  game, group, bulletGroup, x, y, enemyType) {
  Phaser.Sprite.call(this, game, x, y, enemyType.name);
  group.add(this);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.collideWorldBounds = true;
  this.body.bounce.set(1);
  this.anchor.setTo(0.5);
  this.enemyType = enemyType;
  this.state = 'idle';
  this.bulletGroup = bulletGroup;
  this.game = game;
};
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
  switch (this.state) {
    case 'idle':
    break;
  }
};
