var Spawner = function(game, group) {
  this.counts = {outlaw: 0, cowboy: 0, bandito: 0};
  this.texts = {};
  var y = SCREEN_HEIGHT - 10 - 16;
  var style = {
    font: '16px VT323', fill: '#fff', align: 'right'
  };
  var addDisplay = function(icon, ord, key, spawner) {
    var x = SCREEN_WIDTH - 16 * ((3 - ord) * 2 - 1) - 10;
    var text = game.add.text(
      x - 2, y, spawner.counts[key], style
    );
    text.anchor.set(1, 0);
    group.add(text);
    group.add(game.make.sprite(x, y, icon));
    spawner.texts[key] = text;
  }
  addDisplay('outlaw_icon', 0, 'outlaw', this);
  addDisplay('cowboy_icon', 1, 'cowboy', this);
  addDisplay('bandito_icon', 2, 'bandito', this);
};

Spawner.prototype.add = function(key) {
  this.counts[key]++;
  this.texts[key].text = this.counts[key];
};
