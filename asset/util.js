Game.Util = {
  randomString: function (len) {
    var charSource = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    var res='';
    for (var i=0; i<len; i++) {
        res += charSource.random();
    }
    return res;
  },

  init2DArray: function(xdim,ydim,initVal){
    var a = [];
    for (var x=0; x<xdim; x++){
      a.push([]);
      for (var y=0; y<ydim; y++){
        a[x].push(initVal);
      }
    }
    return a;
  },

  randomInt: function (min,max) {
   var range = max - min;
   var offset = Math.floor(ROT.RNG.getUniform()*(range+1));
   return offset+min;
 },

 randomShipName: function(){
   return Game.Util.Idioms[Math.floor(ROT.RNG.getUniform()*Game.Util.Idioms.length)];
 }
};

Game.Util.Idioms = ['idiom1','idiom2','idiom3','idiom4'];
Game.Util.Adjectives = ['adj1','adj2'];
Game.Util.Nouns = ['noun1','noun2'];

Game.Coordinate = function(x,y){
    this.x = x;
    this.y = y;
}
