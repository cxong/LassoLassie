var GameState = function(game){};

GameState.prototype.preload = function() {
};

GameState.prototype.create = function() {
  this.game.stage.backgroundColor = 0xBF844F;

  this.game.physics.startSystem(Phaser.Physics.ARCADE);

  this.sounds = {
    //tada: this.game.add.audio("tada")
  };

  this.groups = {
    bg: this.game.add.group(),
    enemies: this.game.add.group(),
    players: this.game.add.group(),
    enemyBullets: this.game.add.group(),
    playerBullets: this.game.add.group(),
    enemyHits: this.game.add.group(),
    playerHits: this.game.add.group(),
    lasso: this.game.add.group(),
    dialogs: this.game.add.group(),
    lifeCounters: this.game.add.group()
  };

  // Life counters
  for (var i = 2; i >= 0; i--) {
    this.groups.lifeCounters.add(
      this.game.make.sprite(
        10 + 16*i, SCREEN_HEIGHT - 10 - 16, 'health'
      )
    );
  }

  this.spawnPlayer();

  // Add some enemies
  new Enemy(
    this.game,
    this.groups.enemies, this.groups.enemyBullets,
    this.groups.enemyHits,
    this.groups.players,
    80, 60, EnemyTypes.outlaw, true);
  new Enemy(
    this.game,
    this.groups.enemies, this.groups.enemyBullets,
    this.groups.enemyHits,
    this.groups.players,
    90, 50, EnemyTypes.outlaw, true);
  new Enemy(
    this.game,
    this.groups.enemies, this.groups.enemyBullets,
    this.groups.enemyHits,
    this.groups.players,
    200, 90, EnemyTypes.outlaw, true);

  this.dialog = new Dialog(this.game, this.groups.dialogs,0, 0);
  // Hide dialog initially
  this.groups.dialogs.alpha = 0;

  this.keys = this.game.input.keyboard.addKeys({
    up: Phaser.Keyboard.UP,
    down: Phaser.Keyboard.DOWN,
    left: Phaser.Keyboard.LEFT,
    right: Phaser.Keyboard.RIGHT,
    fire: Phaser.Keyboard.Z,
    lasso: Phaser.Keyboard.X,
    spawn1: this.game.input.keyboard.addKey(Phaser.Keyboard.ONE),
    spawn2: this.game.input.keyboard.addKey(Phaser.Keyboard.TWO),
    spawn3: this.game.input.keyboard.addKey(Phaser.Keyboard.THREE)
  });
};

GameState.prototype.spawnPlayer = function() {
  if (this.groups.lifeCounters.total === 0) {
    console.log('GAME OVER!');
    // TODO: game over screen, reset to title
  } else {
    this.player = new Player(
      this.game,
      this.groups.players, this.groups.playerBullets,
      this.groups.playerHits, this.groups.lasso,
      SCREEN_WIDTH / 2, SCREEN_HEIGHT - 32, []);
    this.playerRespawnCounter = 2000;
    this.groups.lifeCounters.getFirstExists().destroy();
  }
};

GameState.prototype.update = function() {
  // Move using arrow keys
  var dx = 0;
  var dy = 0;
  if (this.keys.left.isDown) {
    dx = -1;
  } else if (this.keys.right.isDown) {
    dx = 1;
  }
  if (this.keys.up.isDown) {
    dy = -1;
  } else if (this.keys.down.isDown) {
    dy = 1;
  }
  this.player.move(dx, dy);

  // firing
  if (this.keys.fire.isDown) {
    this.player.fire();
  }

  // Lassoing
  if (this.keys.lasso.isDown) {
    this.player.lasso();
  }

  // Depth sort
  this.groups.enemies.sort(
    'y', Phaser.Group.SORT_ASCENDING);

  // Player bullets to enemy
  this.game.physics.arcade.overlap(
    this.groups.playerHits, this.groups.enemies,
    function(hit, enemy) {
      // TODO: enemy kill effects
      enemy.kill();
    }
  );

  // Lasso
  this.game.physics.arcade.overlap(
    this.groups.lasso, this.groups.enemies,
    function(lasso, enemy) {
      enemy.capture();
    }
  );

  // Enemy bullets to players
  this.game.physics.arcade.overlap(
    this.groups.enemyHits, this.groups.players,
    function(hit, player) {
      if (player.invincibilityCounter > 0) {
        // Can't kill when invincible
        return;
      }
      player.kill();
    }
  );

  // Player respawn
  if (!this.player.alive) {
    this.playerRespawnCounter -= this.game.time.elapsed;
    if (this.playerRespawnCounter <= 0) {
      this.spawnPlayer();
    }
  }

  // TODO: lassoing, spawning
  // TODO: enemy movement
  // TODO: enemy spawning
  // TODO: bullet/lasso overlap
};
