var Spawner = function(game, group) {
  this.counts = [0, 0, 0];
  var y = SCREEN_HEIGHT - 10 - 16;
  var style = {
    font: '16px VT323', fill: '#fff', align: 'right'
  };
  var addDisplay = function(icon, ord, counts) {
    var x = SCREEN_WIDTH - 16 * ((3 - ord) * 2 - 1) - 10;
    var text = game.add.text(x - 2, y, counts[ord], style);
    text.anchor.set(1, 0);
    group.add(text);
    group.add(game.make.sprite(x, y, icon));
  }
  addDisplay('outlaw_icon', 0, this.counts);
  addDisplay('cowboy_icon', 1, this.counts);
  addDisplay('bandito_icon', 2, this.counts);
};
