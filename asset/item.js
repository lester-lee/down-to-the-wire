Game.DATASTORE.ITEM = {};

Game.Item = function(template) {
    this._traitSet = Game.ItemTraits;
    Game.SymbolActive.call(this, template);
    this.attr._generator_key = template._generator_key || '';
    Game.DATASTORE.ITEM[this.attr._ID] = this;
};

Game.Item.extend(Game.SymbolActive);
