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
    nospawn: this.game.add.audio('nospawn'),
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
    spawnerIcons: this.game.add.group(),
    lifeCounters: this.game.add.group(),
    dialogs: this.game.add.group()
  };

  // States: start, dialog, play
  this.state = 'dialog';

  this.dialog = new Dialog(this.game, this.groups.dialogs, 0, 0);

  this.game.input.keyboard.addKey(Phaser.Keyboard.Z).onDown.add(function() {
  this.game.input.keyboard.removeKey(Phaser.Keyboard.Z);
    this.start();
  }, this);
};

GameState.prototype.start = function() {
  // Hide dialog
  this.groups.dialogs.alpha = 0;

  // Spawn player and enemies

  // Life counters
  this.groups.lifeCounters.destroy();
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

  this.groups.players.destroy(true, true);
  this.spawnPlayer();

  this.groups.enemies.destroy(true, true);
  this.wave = new Wave(this.game, this.groups);
  // Enemies will be spawned automatically by wave

  // Initialise controls
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
    this.spawnAlly('outlaw');
  }, this);
  this.keys.spawn2.onDown.add(function() {
    this.spawnAlly('cowboy');
  }, this);
  this.keys.spawn3.onDown.add(function() {
    this.spawnAlly('bandito');
  }, this);

  this.state = 'play';
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
  // Can't spawn more than 6 on the field
  var friendlies = this.groups.players.countLiving();
  if (this.player.alive) {
    friendlies--;
  }
  if (friendlies >= 6 || !this.spawner.trySpawn(key)) {
    this.sounds.nospawn.play();
    return;
  }
  // Spawn ally near where player is
  var x = Phaser.Math.clamp(
    (Math.random() - 0.5) * 100 + this.player.x,
    0, SCREEN_WIDTH);
  new Enemy(
    this.game,
    this.groups.players, this.groups.playerBullets,
    this.groups.playerHits,
    this.groups.enemies, this.groups.bg,
    x, SCREEN_HEIGHT, EnemyTypes[key], false);
  this.sounds.spawn.play();
};

GameState.prototype.update = function() {
  if (this.state === 'play') {
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
        enemy.killAndLeaveCorpse();
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
        player.killAndLeaveCorpse();
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

    // Enemy spawning
    if (this.groups.enemies.countLiving() === 0) {
      this.wave.wave++;
      this.wave.spawn();
      // TODO: some sort of incidental music
    }
  }
};

GameState.prototype.render = function() {
  //this.game.debug.body(this.player);
};
