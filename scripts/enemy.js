var EnemyTypes = {
  outlaw: {
    name: 'outlaw',
    speed: 20,
    stateCounter: 2000,
    fireCounter: 1500,
    spread: 30,
    bulletLifespan: 1500
  }
};

var Enemy = function(
  game, group, bulletGroup, hitGroup, friendlyGroup,
  x, y, enemyType, isEnemy) {
  var key = enemyType.name;
  if (!isEnemy) {
    key += '_ally';
  }
  Phaser.Sprite.call(this, game, x, y, key);
  group.add(this);
  game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.collideWorldBounds = true;
  this.body.bounce.set(1);
  this.anchor.setTo(0.5);
  this.enemyType = enemyType;
  this.isEnemy = isEnemy;
  this.captured = false;

  // State machine
  this.state = 'idle';
  this.stateCounter = 0;
  this.fireCounter = 0;
  this.fireDirection = null;

  this.bulletGroup = bulletGroup;
  this.game = game;
  this.hitGroup = hitGroup;
  this.friendlyGroup = friendlyGroup;
};
Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

Enemy.prototype.update = function() {
  if (!this.alive) {
    return;
  }
  if (this.captured) {
    return;
  }
  this.stateCounter -= this.game.time.elapsed;
  var stateChange = false;
  if (this.stateCounter <= 0) {
    // Switch state
    this.state = choose(['idle', 'move', 'fire']);
    this.stateCounter = this.enemyType.stateCounter;
    stateChange = true;
  }
  switch (this.state) {
    case 'idle':
    if (stateChange) {
      this.body.velocity.setTo(0);
    }
    break;
    case 'move':
    if (stateChange) {
      var targetPosition = null;
      if (Math.random() < 0.3) {
        // Move towards an enemy
        targetPosition = this.getClosestTargetPosition();
      }
      var v;
      if (targetPosition) {
        // Stay in front of the enemy
        if (this.isEnemy) {
          targetPosition.y -= 60;
        } else {
          targetPosition.y += 60;
        }
        v = Phaser.Point.subtract(
          targetPosition, this.position
        );
        // Add a random offset
        v.add(
          (Math.random() - 0.5) * this.enemyType.spread,
          (Math.random() - 0.5) * this.enemyType.spread
        );
      } else {
        // Wander randomly
        v = new Phaser.Point(
          choose([-1, 1]), Math.random() - 0.5);
      }
      v = v.normalize();
      v.x *= this.enemyType.speed;
      v.y *= this.enemyType.speed;
      this.body.velocity = v;
    }
    break;
    case 'fire':
    if (stateChange) {
      // Find a new direction to fire
      // Randomly choose to fire in the general direction
      // of the player
      var targetPosition = null;
      if (Math.random() < 0.3) {
        // Fire at closest target
        targetPosition = this.getClosestTargetPosition();
      }
      if (!targetPosition) {
        // target a random point on the field
        if (this.isEnemy) {
          // Target lower half of field
          targetPosition = new Phaser.Point(
            Math.random() * SCREEN_WIDTH,
            (Math.random() / 2 + 0.5) * SCREEN_HEIGHT
          );
        } else {
          // Target upper half of field
          targetPosition = new Phaser.Point(
            Math.random() * SCREEN_WIDTH,
            Math.random() / 2 * SCREEN_HEIGHT
          );
        }
      }
      // Add a random offset
      this.fireDirection = Phaser.Point.subtract(
        targetPosition, this.position
      );
      this.fireDirection.add(
        (Math.random() - 0.5) * this.enemyType.spread,
        (Math.random() - 0.5) * this.enemyType.spread
      );
      this.fireDirection = this.fireDirection.normalize();
      this.fireDirection.setMagnitude(50);
    }
    this.fire();
    this.body.velocity.setTo(0);
    break;
  }
};

Enemy.prototype.getClosestTargetPosition = function() {
  var targetPosition = null;
  var minDistance = -1;
  this.friendlyGroup.forEach(function(friendly) {
    var distance = this.game.physics.arcade.distanceBetween(
      this, friendly
    );
    if (targetPosition === null ||
      minDistance > distance) {
      targetPosition = friendly.position.clone();
      minDistance = distance;
    }
  }, this);
  return targetPosition;
};

Enemy.prototype.fire = function() {
  if (this.fireCounter > 0) {
    this.fireCounter -= this.game.time.elapsed;
  } else {
    this.fireCounter = this.enemyType.fireCounter;
    var bulletKey = 'enemy_bullet';
    var explosionKey = 'enemy_explosion';
    if (!this.isEnemy) {
      bulletKey = 'ally_bullet';
      explosionKey = 'ally_explosion';
    }
    new Bullet(
      this.game, this.bulletGroup, this.hitGroup,
      this.enemyType.bulletLifespan,
      bulletKey, explosionKey, this.x, this.y,
      this.fireDirection.x, this.fireDirection.y
    );
  }
};

Enemy.prototype.capture = function() {
  this.captured = true;
  this.body.velocity.setTo(0, LASSO_DY);
  this.lifespan = LASSO_LIFESPAN;
  // TODO: captured animation
};
