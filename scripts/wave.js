// Controls difficulty and enemy spawning
var Wave = function(game, groups) {
  this.wave = 0;
  this.game = game;
  this.groups = groups;
};

Wave.prototype.spawn = function() {
  var total = 2 + Math.floor(Math.sqrt(this.wave));
  var choices = ['outlaw', 'cowboy', 'bandito'];
  if (this.wave === 1) {
    // Always start with 3 outlaws
    choices = ['outlaw'];
  } else if (this.wave === 2) {
    choices = ['outlaw', 'cowboy'];
  }
  for (var i = 0; i < total; i++) {
    this.spawnOne(choose(choices));
  }
};

Wave.prototype.spawnOne = function(key) {
  // Spawn enemy along top
  new Enemy(
    this.game,
    this.groups.enemies, this.groups.enemyBullets,
    this.groups.enemyHits,
    this.groups.players, this.groups.bg,
    Math.random() * SCREEN_WIDTH, 0,
    EnemyTypes[key], true);
};
