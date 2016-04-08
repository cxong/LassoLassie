var TILE_SIZE = 32;
var SCREEN_WIDTH = 320;
var SCREEN_HEIGHT = 240;

// http://stackoverflow.com/a/9071606/2038264
function choose(choices) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}
