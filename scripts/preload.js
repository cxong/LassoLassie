var BasicGame = {};
BasicGame.Preload = function (game) {
    this.preloadBar = null;
};

var assets = {
  spritesheets: [
    ['lassie', 35, 42],
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
    'player_bullet', 'player_explosion', 'rope'
  ],
  sounds: [
    'catch', 'die', 'hit', 'lasso_in', 'lasso_out',
    'shoot', 'spawn'
  ]
}

BasicGame.Preload.prototype = {
  preload: function () {
    this.preloadBar = this.add.sprite((SCREEN_WIDTH - 32) / 2,
                                      (SCREEN_HEIGHT - 32) / 2,
                                      'icon');
    this.preloadBar.animations.add('bob', [0, 1], 4, true);
    this.preloadBar.animations.play('bob');
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
