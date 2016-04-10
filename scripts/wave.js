// Controls difficulty and enemy spawning
var Wave = function(game, groups) {
  this.wave = 0;
  this.game = game;
  this.groups = groups;
};

Wave.prototype.spawn = function() {
  var total = 4 + Math.floor(Math.sqrt(this.wave)*2);
  var choices = ['outlaw', 'cowboy', 'bandito'];
  if (this.wave === 1) {
    // Always start with outlaws
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
    EnemyTypes[key], true, this);
};

Wave.prototype.speed = function() {
  return Math.sqrt(this.wave) / 5 + 0.8;
};

Wave.prototype.bulletSpeed = function() {
  return 50 + this.wave;
};

Wave.prototype.bulletLifespan = function() {
  return Math.pow(0.99, this.wave);
};

Wave.prototype.fireCounter = function() {
  return Math.pow(0.98, this.wave);
};
