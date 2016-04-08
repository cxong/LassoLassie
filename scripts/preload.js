var BasicGame = {};
BasicGame.Preload = function (game) {
    this.preloadBar = null;
};

var assets = {
  spritesheets: [
    ['lassie', 35, 42],
    ['dialog', 320, 240],
    ['outlaw', 27, 36],
    ['cowboy', 34, 35],
    ['bandito', 42, 38],
  ],
  images: ['bullet', 'crosshair']
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

    // TODO: sounds
    //this.game.load.audio('step', 'sounds/step.wav');
  },

  create: function () {
    this.state.start('game');
  }
};
