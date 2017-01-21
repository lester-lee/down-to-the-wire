Game.DATASTORE.ITEM = {};

Game.Item = function(template) {
    this._traitSet = Game.ItemTraits;
    Game.SymbolActive.call(this, template);
    this.attr._generator_key = template._generator_key || '';
    this.attr.itemOptions = this.attr.itemOptions || [];
    this.attr.itemOptions.push('Cancel');
    this.attr.itemFunctions = this.attr.itemFunctions || {};
    this.attr.itemFunctions['Cancel'] = function(){
        Game.removeUIMode();
    };

    Game.DATASTORE.ITEM[this.attr._ID] = this;
};

Game.Item.extend(Game.SymbolActive);

Game.Item.prototype.getOptions = function() {
    return this.attr.itemOptions;
}
Game.Item.prototype.getFunctions = function() {
    return this.attr.itemFunctions;
}
