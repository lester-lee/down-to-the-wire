Game.SymbolActive = function(template) {
    template = template || {};
    Game.Symbol.call(this, template);
    this.attr._name = template.name || '';
    this.attr._short_desc = template.short_desc || '';
    this.attr._long_desc = template.long_desc || '';
    this.attr._ID = template.presetID || Game.Util.randomString(16);
    // mixins/traits
    this._traitNames = template.traits || {};
    this._traits = [];
    for (var i = 0; i < this._traitNames.length; i++) {
        this._traits.push(this._traitSet[this._traitNames[i]]);
    }
    this._traitTracker = {};
    for (var i = 0; i < this._traits.length; i++) {
        var trait = this._traits[i];
        this._traitTracker[trait.META.traitName] = true;
        this._traitTracker[trait.META.traitGroup] = true;
        for (var traitProp in trait) {
            if (traitProp != 'META' && trait.hasOwnProperty(traitProp)) {
                this[traitProp] = trait[traitProp];
            }
        }
        if (trait.META.hasOwnProperty('stateNamespace')) {
            this.attr[trait.META.stateNamespace] = {};
            for (var traitStateProp in trait.META.stateModel) {
                if (trait.META.stateModel.hasOwnProperty(traitStateProp)) {
                    if (typeof trait.META.stateModel[traitStateProp] == 'object') {
                        this.attr[trait.META.stateNamespace][traitStateProp] = JSON.parse(JSON.stringify(trait.META.stateModel[traitStateProp]));
                    } else {
                        this.attr[trait.META.stateNamespace][traitStateProp] = trait.META.stateModel[traitStateProp];
                    }
                }
            }
        }
        if (trait.META.hasOwnProperty('init')) {
            trait.META.init.call(this, template);
        }
    }
};

Game.SymbolActive.extend(Game.Symbol);

Game.SymbolActive.prototype.getID = function() {
    return this.attr._ID;
};

Game.SymbolActive.prototype.getName = function() {
    return this.attr._name;
};
Game.SymbolActive.prototype.setName = function(name) {
    this.attr._name = name;
};

Game.SymbolActive.prototype.getShortDesc = function() {
    return this.attr._short_desc;
};

Game.SymbolActive.prototype.getLongDesc = function() {
    return this.attr._long_desc;
};

Game.SymbolActive.prototype.hasTrait = function(check) {
    if (typeof check == 'object') {
        return this._traitTracker.hasOwnProperty(check.META.traitName);
    } else {
        return this._traitTracker.hasOwnProperty(check);
    }
};

Game.SymbolActive.prototype.raiseSymbolActiveEvent = function(evtLabel, evtData) {
    var response = {};
    for (var i = 0; i < this._traits.length; i++) {
        var trait = this._traits[i];
        if (trait.META.listeners && trait.META.listeners[evtLabel]) {
            var resp = trait.META.listeners[evtLabel].call(this, evtData);
            for (var respKey in resp) {
                response[respKey] = resp[respKey];
            }
        }
    }
    return response;
};


Game.SymbolActive.prototype.toJSON = function() {
    // return Game.UIMode.persistence.BASE_toJSON.call(this);
};

Game.SymbolActive.prototype.fromJSON = function(json) {
    // return Game.UIMode.persistence.BASE_fromJSON.call(this, json);
};
