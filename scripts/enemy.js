var EnemyTypes = {
  outlaw: {
    name: 'outlaw',
    speed: 20,
    stateCounter: 2000,
    fireCounter: 1500,
    spread: 15,
    bulletLifespan: 1500,
    counters: 'bandito'
  },
  cowboy: {
    name: 'cowboy',
    speed: 30,
    stateCounter: 1500,
    fireCounter: 1000,
    spread: 20,
    bulletLifespan: 1300,
    counters: 'outlaw'
  },
  bandito: {
    name: 'bandito',
    speed: 15,
    stateCounter: 2500,
    fireCounter: 1000,
    spread: 10,
    bulletLifespan: 2000,
    counters: 'cowboy'
  }
};

var Enemy = function(
  game, group, bulletGroup, hitGroup, friendlyGroup,
  bgGroup,
  x, y, enemyType, isEnemy, wave) {
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
  this.wave = wave;
  this.captured = false;

  // animations
  this.animations.add('fire', [0, 1], 10, false);
  this.animations.add('idle', [2, 3], 2, true);
  this.animations.add('walk', [4, 5], 10, true);

  // State machine
  // Initialise state to 'entering' - running onto
  // the field
  this.state = 'entering';
  this.stateCounter = Math.random() * 500 + 500;
  this.animations.play('walk');
  if (this.isEnemy) {
    this.body.velocity.y = this.speed() * 2;
  } else {
    this.body.velocity.y = -this.speed() * 2;
  }
  this.fireCounter = 0;
  this.fireDirection = null;

  this.bulletGroup = bulletGroup;
  this.game = game;
  this.hitGroup = hitGroup;
  this.friendlyGroup = friendlyGroup;
  this.bgGroup = bgGroup;
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
    case 'entering':
    // State change managed in constructor
    break;
    case 'idle':
    if (stateChange) {
      this.body.velocity.setTo(0);
      this.animations.play('idle');
    }
    break;
    case 'move':
    if (stateChange) {
      var target = null;
      if (Math.random() < 0.5) {
        // Move towards an enemy
        target = this.getClosestTarget();
      }
      var v;
      if (target) {
        // Stay in front of the enemy
        var targetPosition = target.position.clone();
        if (this.isEnemy) {
          targetPosition.y -= 20;
        } else {
          // Friendlies more aggro
          //targetPosition.y += 20;
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
      v.x *= this.speed();
      v.y *= this.speed();
      this.body.velocity = v;
      this.animations.play('walk');
    }
    break;
    case 'fire':
    if (stateChange) {
      // Find a new direction to fire
      // Randomly choose to fire in the general direction
      // of the player
      var target = null;
      if (Math.random() < 0.5) {
        // Fire at closest target
        target = this.getClosestTarget();
      }
      var targetPosition;
      if (!target) {
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
      } else {
        targetPosition = target.position.clone();
      }
      this.fireDirection = Phaser.Point.subtract(
        targetPosition, this.position
      );
      // Add a random offset
      if (!target ||
        target.key !== this.enemyType.counters) {
        this.fireDirection.add(
          (Math.random() - 0.5) * this.enemyType.spread,
          (Math.random() - 0.5) * this.enemyType.spread
        );
      }
      var magnitude = 50;
      // Hard counter
      if (target &&
        target.key === this.enemyType.counters) {
        var idealMagnitude = this.fireDirection.getMagnitude() / (this.enemyType.bulletLifespan / 1000.0);
        if (idealMagnitude < magnitude * 2) {
          magnitude = idealMagnitude;
        }
      }
      this.fireDirection = this.fireDirection.normalize();
      this.fireDirection.setMagnitude(magnitude);
    }
    this.fire();
    this.body.velocity.setTo(0);
    break;
  }
};

Enemy.prototype.getClosestTarget = function() {
  var target = null;
  var minDistance = -1;
  this.friendlyGroup.forEachAlive(function(friendly) {
    var distance = this.game.physics.arcade.distanceBetween(
      this, friendly
    );
    if (target === null || minDistance > distance) {
      target = friendly;
      minDistance = distance;
    }
  }, this);
  return target;
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
    this.animations.play('fire');
  }
};

Enemy.prototype.capture = function() {
  this.captured = true;
  this.body.velocity.setTo(0, LASSO_DY);
  this.lifespan = LASSO_LIFESPAN;
  this.animations.stop();
  this.frame = 6;
};

Enemy.prototype.killAndLeaveCorpse = function() {
  this.kill();
  // Leave a corpse on the background layer
  var corpse = this.game.make.sprite(
    this.x, this.y, this.key);
  corpse.anchor.setTo(0.5);
  corpse.animations.add('die', [6, 7], 2, false);
  corpse.animations.play('die');
  this.bgGroup.add(corpse);
};

Enemy.prototype.speed = function() {
  return this.wave.speed() * this.enemyType.speed;
};
