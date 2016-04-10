(function() { setTimeout(function () {
  GJAPI.iGameID = 139981;
  GJAPI.sGameKey = 'e58fb3c6c8a006d2131874b2b43bc9d1';
  document.getElementById('fontLoader').style.display = 'none';
  var game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO,
                             'gameContainer', null, false,
                             false);
  game.state.add('boot', BasicGame.Boot);
  game.state.add('preload', BasicGame.Preload);
  game.state.add('game', GameState);
  game.state.start('boot');
}, 1000); })();
