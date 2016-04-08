var EnemyTypes = {
  outlaw: {
    name: 'outlaw',
    speed: 30,
    stateCounter: 1000
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

  // State machine
  this.state = 'idle';
  this.stateCounter = 0;

  this.bulletGroup = bulletGroup;
  this.game = game;
};
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
  this.stateCounter -= this.game.time.elapsed;
  if (this.stateCounter <= 0) {
    // Switch state
    this.state = choose(['idle', 'move', 'fire']);
    this.stateCounter = this.enemyType.stateCounter;
  }
  switch (this.state) {
    case 'idle':
    this.body.velocity.setTo(0);
    break;
    case 'move':
    if (this.body.velocity.isZero()) {
      var v = new Phaser.Point(
        choose([-1, 1]), Math.random() - 0.5);
      v = v.normalize();
      v.x *= this.enemyType.speed;
      v.y *= this.enemyType.speed;
      this.body.velocity = v;
    }
    break;
    case 'fire':
    // TODO: firing
    this.body.velocity.setTo(0);
    break;
  }
};
