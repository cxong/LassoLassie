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

  this.game.add.audio('lassolady').play('', 0, 0.7, true);

  this.groups = {
    ground: this.game.add.group(),
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
    text: this.game.add.group(),
    dialogs: this.game.add.group()
  };

  var sand = this.game.add.tileSprite(
    0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, 'sand');
  this.groups.ground.add(sand);

  this.text = this.game.add.text(
    SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, '', {
      font: '36px VT323', fill: '#fff', align: 'center'
    }
  );
  this.text.anchor.set(0.5);
  this.groups.text.add(this.text);
  this.textCounter = 0;
  this.waveText = this.game.add.text(
    SCREEN_WIDTH / 2, SCREEN_HEIGHT - 14, '', {
      font: '16px VT323', fill: '#fff', align: 'center'
    }
  );
  this.waveText.anchor.set(0.5);
  this.groups.text.add(this.waveText);

  this.spawner = new Spawner(
    this.game, this.groups.spawnerIcons
  );

  this.dialog = new Dialog(this.game, this.groups.dialogs, 0, 0);

  // States: dialog, play, over
  this.restart();
};

GameState.prototype.restart = function() {
  this.state = 'dialog';
  this.groups.dialogs.alpha = 1;
  this.game.input.keyboard.addKey(Phaser.Keyboard.Z).onDown.add(function() {
    this.start();
  }, this);
  // TODO: incidental music
};

GameState.prototype.start = function() {
  // Hide dialog
  this.groups.dialogs.alpha = 0;

  // Spawn player and enemies

  // Life counters
  this.groups.lifeCounters.destroy(true, true);
  for (var i = 2; i >= 0; i--) {
    this.groups.lifeCounters.add(
      this.game.make.sprite(
        10 + 16*i, SCREEN_HEIGHT - 10 - 16, 'health'
      )
    );
  }

  // Spawn counters
  this.spawner.reset();

  this.groups.bg.destroy(true, true);

  this.groups.players.destroy(true, true);
  this.spawnPlayer();

  this.groups.enemies.destroy(true, true);
  this.wave = new Wave(this.game, this.groups);
  this.friendlyWave = new Wave(this.game, this.groups);
  // Enemies will be spawned automatically by wave

  // Initialise controls
  this.game.input.keyboard.reset(true);
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
  // TODO: incidental music
};

GameState.prototype.spawnPlayer = function() {
  if (this.groups.lifeCounters.total === 0) {
    this.state = 'over';
    this.game.input.keyboard.reset(true);
    this.game.input.keyboard.addKey(Phaser.Keyboard.Z).onDown.add(function() {
      this.restart();
    }, this);
    this.setText('Game Over');
    // TODO: sad game over music
  } else {
    this.player = new Player(
      this.game,
      this.groups.players, this.groups.playerBullets,
      this.groups.playerHits, this.groups.lasso,
      this.groups.bg,
      SCREEN_WIDTH / 2, SCREEN_HEIGHT - 32, []);
    this.playerRespawnCounter = 2000;
    this.groups.lifeCounters.getFirstExists().destroy();
    this.sounds.respawn.play();
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
    x, SCREEN_HEIGHT, EnemyTypes[key], false,
    this.friendlyWave);
  this.sounds.spawn.play();
};

GameState.prototype.update = function() {
  if (this.state === 'play') {
    this.textCounter -= this.game.time.elapsed;
    if (this.textCounter <= 0) {
      this.text.alpha = 0;
    }

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

    // Player respawn
    if (this.player && !this.player.alive) {
      this.playerRespawnCounter -= this.game.time.elapsed;
      if (this.playerRespawnCounter <= 0) {
        this.spawnPlayer();
      }
    }
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
      if (this.spawner.add(enemy.key)) {
        this.sounds.catch.play();
      }
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

  // Enemy spawning
  // Note: spawn next wave if less than half wave
  // remaining
  if (this.wave &&
    this.groups.enemies.countLiving() < this.wave.waveTotal() / 2) {
    this.wave.wave++;
    this.wave.spawn();
    this.setText('Wave ' + this.wave.wave);
    this.waveText.text = 'Wave ' + this.wave.wave;
    // TODO: some sort of incidental music
    if (GJAPI.bActive) {
      GJAPI.ScoreAdd(0, this.wave.wave, 'Wave ' + this.wave.wave);
    }
  }
};

GameState.prototype.setText = function(text) {
  this.text.text = text;
  this.textCounter = 3000;
  this.text.alpha = 1;
};

GameState.prototype.render = function() {
  //this.game.debug.body(this.player);
};
