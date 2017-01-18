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
            'attackMiss': function(evtData) {
                Game.Message.send("You miss your attack on " + evtData.target.getName());
            },
            'madeKill': function(evtData) {
                Game.Message.send("You destroy " + evtData.dead.getName());
            },
            'dealtDamage': function(evtData) {
                Game.Message.send("You deal " + evtData.damage + " damage to the " + evtData.attacked.getName());
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
        },
        listeners: {
            'attacked': function(evtData) {
                var defense = this.raiseEntityEvent('getDefense') || 0;
                var dmg = evtData.attack - defense;
                this.takeDamage(dmg);
                evtData.attacker.raiseEntityEvent('dealtDamage', {
                    attacked: this,
                    damage: dmg
                });
                if (this.getCurHP() <= 0) {
                    this.raiseEntityEvent('killed', {
                        entKilled: this,
                        killedBy: evtData.attacker
                    });
                    evtData.attacker.raiseEntityEvent('madeKill', {
                        dead: this,
                        killer: evtData.attacker
                    });
                }
            },
            'killed': function(evtData) {
                this.destroy();
            }
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
};

Game.EntityTraits.MeleeAttacker = {
    META: {
        traitName: 'MeleeAttacker',
        traitGroup: 'Attacker',
        stateNamespace: '_MeleeAttacker_attr',
        stateModel: {
            attack: 1,
            attackAccuracy: .95
        },
        init: function(template) {
            this.attr._MeleeAttacker_attr.attack = template.attack || 1;
        },
        listeners: {
            'bumpEntity': function(evtData) {
                var hit = this.getAttackAccuracy()
                var dodge = evtData.target.raiseEntityEvent('getDodge') || 0;
                if (ROT.RNG.getUniform() <= hit - dodge) {
                    evtData.target.raiseEntityEvent('attacked', {
                        attacker: evtData.actor,
                        attack: this.getAttack()
                    });
                } else {
                    this.raiseEntityEvent('attackMiss', {
                        attacker: evtData.actor,
                        target: evtData.target
                    });
                }
            }
        }
    },
    getAttack: function() {
        return this.attr._MeleeAttacker_attr.attack;
    },
    getAttackAccuracy: function() {
        return this.attr._MeleeAttacker_attr.attackAccuracy;
    }
};

Game.EntityTraits.MeleeDefender = {
    META: {
        traitName: 'MeleeDefender',
        traitGroup: 'Defender',
        stateNamespace: '_MeleeDefender_attr',
        stateModel: {
            defense: 1,
            dodge: .05
        },
        init: function(template) {
            this.attr._MeleeDefender_attr.defense = template.defense || 1;
            this.attr._MeleeDefender_attr.dodge = template.dodge || .05;
        },
        listeners: {
            'bumpEntity': function(evtData) {
                evtData.target.raiseEntityEvent('attacked', {
                    attacker: evtData.actor,
                    attack: this.getAttack()
                });
            },
            'getDodge': function() {
                return this.getDodge();
            },
            'getDefense': function() {
                return this.getDefense();
            }
        }
    },
    getDefense: function() {
        return this.attr._MeleeDefender_attr.defense;
    },
    getDodge: function() {
        return this.attr._MeleeDefender_attr.dodge;
    }
};
