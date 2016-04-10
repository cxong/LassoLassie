var GameState = function(game){};

GameState.prototype.preload = function() {
};

GameState.prototype.create = function() {
  this.game.stage.backgroundColor = 0xBF844F;

  this.game.physics.startSystem(Phaser.Physics.ARCADE);

  this.sounds = {
    catch: this.game.add.audio('catch'),
    die: this.game.add.audio('die'),
    hit: this.game.add.audio('hit'),
    respawn: this.game.add.audio('respawn'),
    spawn: this.game.add.audio('spawn')
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
    spawnerIcons: this.game.add.group(),
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

  // Spawn counters
  this.spawner = new Spawner(
    this.game, this.groups.spawnerIcons
  );

  this.spawnPlayer();

  // Add some enemies
  this.spawnEnemy('outlaw');
  this.spawnEnemy('outlaw');
  this.spawnEnemy('cowboy');
  this.spawnEnemy('cowboy');
  this.spawnEnemy('bandito');
  this.spawnEnemy('bandito');

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
    spawn1: Phaser.Keyboard.ONE,
    spawn2: Phaser.Keyboard.TWO,
    spawn3: Phaser.Keyboard.THREE
  });
  this.keys.spawn1.onDown.add(function() {
    if (this.spawner.trySpawn('outlaw')) {
      this.spawnAlly('outlaw');
    }
  }, this);
  this.keys.spawn2.onDown.add(function() {
    if (this.spawner.trySpawn('cowboy')) {
      this.spawnAlly('cowboy');
    }
  }, this);
  this.keys.spawn3.onDown.add(function() {
    if (this.spawner.trySpawn('bandito')) {
      this.spawnAlly('bandito');
    }
  }, this);
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

GameState.prototype.spawnAlly = function(key) {
  // Spawn ally near where player is
  var x = Phaser.Math.clamp(
    (Math.random() - 0.5) * 100 + this.player.x,
    0, SCREEN_WIDTH);
  new Enemy(
    this.game,
    this.groups.players, this.groups.playerBullets,
    this.groups.playerHits,
    this.groups.enemies,
    x, SCREEN_HEIGHT, EnemyTypes[key], false);
  this.sounds.spawn.play();
};

GameState.prototype.spawnEnemy = function(key) {
  // Spawn enemy along top
  new Enemy(
    this.game,
    this.groups.enemies, this.groups.enemyBullets,
    this.groups.enemyHits,
    this.groups.players,
    Math.random() * SCREEN_WIDTH, 0,
    EnemyTypes[key], true);
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
  this.groups.players.sort(
    'y', Phaser.Group.SORT_ASCENDING);

  // Player bullets to enemy
  this.game.physics.arcade.overlap(
    this.groups.playerHits, this.groups.enemies,
    function(hit, enemy) {
      // TODO: enemy kill effects
      hit.kill();
      enemy.kill();
      this.sounds.hit.play();
    }, null, this
  );

  // Lasso
  this.game.physics.arcade.overlap(
    this.groups.lasso, this.groups.enemies,
    function(lasso, enemy) {
      enemy.capture();
      lasso.kill();
      this.spawner.add(enemy.key);
      this.sounds.catch.play();
    }, null, this
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
      if (player === this.player) {
        this.sounds.die.play();
      } else {
        this.sounds.hit.play();
      }
    }, null, this
  );

  // Player respawn
  if (!this.player.alive) {
    this.playerRespawnCounter -= this.game.time.elapsed;
    if (this.playerRespawnCounter <= 0) {
      this.spawnPlayer();
      this.sounds.respawn.play();
    }
  }

  // TODO: enemy spawning
};

GameState.prototype.render = function() {
  //this.game.debug.body(this.player);
};
