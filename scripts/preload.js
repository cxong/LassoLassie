var BasicGame = {};
BasicGame.Preload = function (game) {
    this.preloadBar = null;
};

var assets = {
  spritesheets: [
    ['dialog', 320, 240],
    ['outlaw', 24, 24],
    ['cowboy', 24, 24],
    ['bandito', 24, 24],
    ['outlaw_ally', 24, 24],
    ['cowboy_ally', 24, 24],
    ['bandito_ally', 24, 24]
  ],
  images: [
    'outlaw_icon', 'cowboy_icon', 'bandito_icon',
    'ally_bullet', 'ally_explosion',
    'enemy_bullet', 'enemy_explosion',
    'crosshair', 'health', 'lasso', 'lasso_hit',
    'player_bullet', 'player_explosion', 'rope', 'sand'
  ],
  sounds: [
    'catch', 'die', 'hit', 'lasso_in', 'lasso_out',
    'nospawn', 'respawn', 'shoot', 'spawn'
  ]
}

BasicGame.Preload.prototype = {
  preload: function () {
    this.preloadBar = this.add.sprite((SCREEN_WIDTH - 24) / 2,
                                      (SCREEN_HEIGHT - 24) / 2,
                                      'lassie');
    this.preloadBar.animations.add(
      'run_right', [12, 13, 14, 15], 20, true
    );
    this.preloadBar.animations.play('run_right');
    this.load.setPreloadSprite(this.preloadBar);

    var basicGame = this;
    assets.spritesheets.map(function(s) {
      basicGame.game.load.spritesheet(
        s[0], 'images/' + s[0] + '.png', s[1], s[2]);
    });
    assets.images.map(function(i) {
      basicGame.game.load.image(i, 'images/' + i + '.png');
    });

    // TODO: music
    //this.game.load.audio('birds', 'sounds/birds.mp3');

    assets.sounds.map(function(i) {
      basicGame.game.load.audio(i, 'sounds/' + i + '.wav');
    });
  },

  create: function () {
    this.state.start('game');
  }
};
