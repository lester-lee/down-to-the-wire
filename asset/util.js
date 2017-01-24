Game.Util = {
    randomString: function(len) {
        var charSource = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
        var res = '';
        for (var i = 0; i < len; i++) {
            res += charSource.random();
        }
        return res;
    },

    init2DArray: function(xdim, ydim, initVal) {
        var a = [];
        for (var x = 0; x < xdim; x++) {
            a.push([]);
            for (var y = 0; y < ydim; y++) {
                a[x].push(initVal);
            }
        }
        return a;
    },

    randomInt: function(min, max) {
        var range = max - min;
        var offset = Math.floor(ROT.RNG.getUniform() * (range + 1));
        return offset + min;
    },

    arrayObjectToID: function(obj){
        return obj.map(function(elem){
          return elem.getID();
        });
    },

    getDisplayDim: function(display) {
        return {
            w: display._options.width,
            h: display._options.height
        };
    },

    getAdjacentPos: function(pos){
      var adjPos = [];
      for (var dx = -1; dx <= 1; dx++){
        for (var dy = -1; dy <= 1; dy++){
          if (dx !== 0 && dy !== 0){
            adjPos.push({x:pos.x+dx,y:pos.y+dy});
          }
        }
      }
      return adjPos;
    },

    randomShipName: function() {
        var index = Math.floor(ROT.RNG.getUniform() * Game.Util.Idioms.length);
        return Game.Util.Idioms.splice(index, 1)[0];
    },

    randomDroneName: function() {
        return Game.Util.Adjectives[Math.floor(ROT.RNG.getUniform() * Game.Util.Adjectives.length)] +
            " " + Game.Util.Nouns[Math.floor(ROT.RNG.getUniform() * Game.Util.Nouns.length)];
    },

    calcDamage: function(attack, defense){
        var mod = ROT.RNG.getUniform()*.5 + 0.5;
        var dmg = (attack/defense);
        return Math.floor(dmg*mod);
    },
    getStatusColor: function(status) {
        switch (status) {
            case "Damaged":
                return '#f80';
            case "Broken":
                return '#f20';
            default:
                return Game.UIMode.DEFAULT_FG;
        }
    }
};

Game.Util.Adjectives = ['aback', 'abaft', 'abandoned', 'abashed', 'aberrant', 'abhorrent', 'abiding', 'abject', 'ablaze', 'able', 'abnormal', 'aboard', 'aboriginal', 'abortive', 'abounding', 'abrasive', 'abrupt', 'absent', 'absorbed', 'absorbing', 'abstracted', 'absurd', 'abundant',
    'abusive', 'acceptable', 'accessible', 'accidental', 'accurate', 'acid', 'acidic', 'acoustic', 'acrid', 'actually', 'ad', 'hoc', 'adamant', 'adaptable', 'addicted', 'adhesive', 'adjoining', 'adorable', 'adventurous', 'afraid', 'aggressive', 'agonizing', 'agreeable', 'ahead', 'ajar',
    'alcoholic', 'alert', 'alike', 'alive', 'alleged', 'alluring', 'aloof', 'amazing', 'ambiguous', 'ambitious', 'amuck', 'amused', 'amusing', 'ancient', 'angry', 'animated', 'annoyed', 'annoying', 'anxious', 'apathetic', 'aquatic', 'aromatic', 'arrogant', 'ashamed', 'aspiring', 'assorted', 'astonishing', 'attractive', 'auspicious', 'automatic', 'available', 'average', 'awake', 'aware', 'awesome', 'awful', 'axiomatic'
];
Game.Util.Nouns = ['noun1', 'noun2'];
