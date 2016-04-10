BasicGame.Boot = function (game) {
};

BasicGame.Boot.prototype = {
  init: function() {
    // Stretch to fit screen
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
    this.game.scale.compatibility.forceMinimumDocumentHeight = true;
    this.game.scale.windowConstraints = {'right': 'layout', 'bottom': 'layout'};
  },

  preload: function () {
    this.game.load.spritesheet(
      'lassie', 'images/lassie.png', 24, 24
    );
  },

  create: function () {
    this.game.stage.backgroundColor = 0x7F5834;
    this.input.maxPointers = 1;

    this.state.start('preload');
  }
};
