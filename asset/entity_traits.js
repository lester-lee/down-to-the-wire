Game.EntityTraits = {};

Game.EntityTraits.PlayerMessager = {
    META: {
        traitName: 'PlayerMessager',
        traitGroup: 'PlayerMessager',
        listeners: {
            'walkForbidden': function(evtData) {
                Game.Message.send("it'd be mighty impolite to walk into " + evtData.target.getName());
                Game.renderMessage();
            },
            'bumpEntity': function(evtData) {
                Game.Message.send("it'd be mighty impolite to walk into " + evtData.target.getName());
                Game.renderMessage();
            }
        }
    }
};

Game.EntityTraits.WalkerCorporeal = {
    META: {
        traitName: 'WalkerCorporeal',
        traitGroup: 'Walker'
    },
    tryWalk: function(map, dx, dy) {
        var newX = Math.min(Math.max(0, this.getPos().x), map.getWidth()) + dx;
        var newY = Math.min(Math.max(0, this.getPos().y), map.getWidth()) + dy;
        var newPos = new Game.Coordinate(newX, newY);
        var ent = map.getEntity(newPos);
        if (ent) {
            this.raiseEntityEvent('bumpEntity', {
                actor: this,
                target: ent
            });
            this.raiseEntityEvent('tookTurn');
            return true;
        }
        var nextTile = map.getTile(newPos);
        if (nextTile.isWalkable()) {
            this.setPos(newPos);
            map.updateEntityLocation(this);
            this.raiseEntityEvent('tookTurn');
            Game.refresh();
            return true;
        } else {
            this.raiseEntityEvent('walkForbidden', {
                target: nextTile
            });
            return false;
        }
    }
};

Game.EntityTraits.Chronicle = {
    META: {
        traitName: 'Chronicle',
        traitGroup: 'Chronicle',
        stateNamespace: '_Chronicle_attr',
        stateModel: {
            turnCounter: 0
        },
        listeners: {
            'tookTurn': function(evtData) {
                this.trackTurns();
            }
        }
    },
    trackTurns: function() {
        this.attr._Chronicle_attr.turnCounter++;
    },
    getTurns: function() {
        return this.attr._Chronicle_attr.turnCounter;
    },
    setTurns: function(n) {
        this.attr._Chronicle_attr.turnCounter = n;
    }
};

Game.EntityTraits.StatHitPoints = {
    META: {
        traitName: 'StatHitPoints',
        traitGroup: 'Stat',
        stateNamespace: '_HP_attr',
        stateModel: {
            maxHP: 1,
            curHP: 1
        },
        init: function(template) {
            this.attr._HP_attr.maxHP = template.maxHP || 1;
            this.attr._HP_attr.curHP = template.curHP || this.attr._HP_attr.maxHP;
        }
    },
    getMaxHP: function() {
        return this.attr._HP_attr.maxHP;
    },
    setMaxHP: function(n) {
        this.attr._HP_attr.maxHP = n;
    },
    getCurHP: function() {
        return this.attr._HP_attr.curHP;
    },
    setCurHP: function(n) {
        this.attr._HP_attr.curHP = n;
    },
    takeDamage: function(amt) {
        this.attr._HP_attr.curHP -= amt;
    },
    recover: function(amt) {
        this.attr._HP_attr.curHP = Math.min(this.attr._HP_attr.curHP + amt, this.attr._HitPoints_attr.maxHP);
    }
}
