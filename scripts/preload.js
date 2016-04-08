var BasicGame = {};
BasicGame.Preload = function (game) {
    this.preloadBar = null;
};

BasicGame.Preload.prototype = {
    preload: function () {
        this.preloadBar = this.add.sprite((SCREEN_WIDTH - 32) / 2,
                                          (SCREEN_HEIGHT - 32) / 2,
                                          'icon');
        this.preloadBar.animations.add('bob', [0, 1], 4, true);
        this.preloadBar.animations.play('bob');
        this.load.setPreloadSprite(this.preloadBar);

        this.game.load.spritesheet('lassie', 'images/lassie.png', 35, 42);
        this.game.load.spritesheet('dialog', 'images/dialog.png', 320, 240);
        this.game.load.spritesheet('outlaw', 'images/outlaw.png', 27, 36);
        this.game.load.spritesheet('cowboy', 'images/cowboy.png', 34, 35);
        this.game.load.spritesheet('bandito', 'images/bandito.png', 42, 38);

        // TODO: music
        //this.game.load.audio('birds', 'sounds/birds.mp3');

        // TODO: sounds
        //this.game.load.audio('step', 'sounds/step.wav');
    },

    create: function () {
        this.state.start('game');
    }
};
