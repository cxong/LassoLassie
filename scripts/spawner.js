var Spawner = function(game, group) {
  this.counts = [0, 0, 0];
  var y = SCREEN_HEIGHT - 10 - 16;
  group.add(game.make.sprite(
    SCREEN_WIDTH - 16 * 5 - 10, y, 'outlaw_icon'
  ));
  group.add(game.make.sprite(
    SCREEN_WIDTH - 16 * 3 - 10, y, 'cowboy_icon'
  ));
  group.add(game.make.sprite(
    SCREEN_WIDTH - 16 * 1 - 10, y, 'bandito_icon'
  ));
};
