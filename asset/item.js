Game.DATASTORE.ITEM = {};

Game.Item = function(template) {
    this._traitSet = Game.ItemTraits;
    Game.SymbolActive.call(this, template);
    this.attr._generator_key = template._generator_key || '';
    this.itemOptions = this.itemOptions || [];
    this.itemOptions.push('Cancel');
    this.itemFunctions = this.itemFunctions || {};
    this.itemFunctions['Cancel'] = function() {
        Game.removeUIMode();
    };
    Game.DATASTORE.ITEM[this.attr._ID] = this;
};

Game.Item.extend(Game.SymbolActive);

Game.Item.prototype.getOptions = function() {
    return this.itemOptions;
}
Game.Item.prototype.getFunctions = function() {
    return this.itemFunctions;
}

Game.Item.prototype.toJSON = function() {
    return Game.UIMode.persistence.BASE_toJSON.call(this);
};

Game.Item.prototype.fromJSON = function(json) {
    return Game.UIMode.persistence.BASE_fromJSON.call(this, json);
};
