Game.KeyBinding = {
    _availableBindings: ['numpad', 'waxd'],
    _curBinding: '',
    _curBindingLookup: {},

    setKeyBinding: function(keys) {
        this._curBinding = keys || 'waxd';
        this.initBindingLookup();
    },
    getKeyBinding: function() {
        return this._curBinding;
    },
    cycleKeyBinding: function() {
        var curIndex = this._availableBindings.indexOf(this._curBinding);
        var nextIndex = (curIndex + 1) % this._availableBindings.length;
        this.setKeyBinding(_availableBindings[nextIndex]);
        this.informPlayer();
    },
    informPlayer: function() {
        Game.Message.send('You are now using ' + _curBinding + ' key bindings');
        Game.renderMessage();
    },
    initBindingLookup: function() {
        this._curBindingLookup = {
            keydown: {
                nometa: {},
                ctrlshift: {},
                shift: {},
                ctrl: {}
            },
            keypress: {
                nometa: {},
                ctrlshift: {},
                shift: {},
                ctrl: {}
            }
        };
        for (var act in this.Action) {
            var info = this.Action[act][this._curBinding] || this.Action[act]['all'];
            if (info) {
                var metakey = 'nometa';
                if (info.inputCtrl && info.inputShift) {
                    var metakey = 'ctrlshift';
                } else if (info.inputCtrl) {
                    var metakey = 'ctrl';
                } else if (info.inputShift) {
                    var metakey = 'shift';
                }
            }
            if (info.inputMatch.constructor === Array) {
                for (var i = 0; i < info.inputMatch.length; i++) {
                    this._curBindingLookup[info.inputType][metakey][info.inputMatch[i]] = {
                        key: act
                    };
                }
            } else {
                this._curBindingLookup[info.inputType][metakey][info.inputMatch] = {
                    key: act
                };
            }
        }
    },
    getInput: function(inputType, inputData) {
        var metakey = 'nometa';
        if (inputData.ctrlKey && inputData.shiftKey) {
            var metakey = 'ctrlshift';
        } else if (inputData.ctrlKey) {
            var metakey = 'ctrl';
        } else if (inputData.shiftKey) {
            var metakey = 'shift';
        }
        var key = inputData.keyCode;
        return this._curBindingLookup[inputType][metakey][key] || false;
    },

    Action: {
        PERSISTENCE: {
            all: {
                inputMatch: ROT.VK_EQUALS,
                inputType: 'keypress',
                inputShift: false,
                inputCtrl: false
            }
        },

        NUM_0: {
            all: {
                inputMatch: ROT.VK_0,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        NUM_1: {
            all: {
                inputMatch: ROT.VK_1,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        NUM_2: {
            all: {
                inputMatch: ROT.VK_2,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        NUM_3: {
            all: {
                inputMatch: ROT.VK_3,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        NUM_4: {
            all: {
                inputMatch: ROT.VK_4,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        NUM_5: {
            all: {
                inputMatch: ROT.VK_5,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        NUM_6: {
            all: {
                inputMatch: ROT.VK_6,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        NUM_7: {
            all: {
                inputMatch: ROT.VK_7,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        NUM_8: {
            all: {
                inputMatch: ROT.VK_8,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        NUM_9: {
            all: {
                inputMatch: ROT.VK_9,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },

        TURN_UL: {
            waxd: {
                inputMatch: ROT.VK_Q,
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD7,
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            }
        },
        TURN_UP: {
            waxd: {
                inputMatch: [ROT.VK_W, ROT.VK_UP],
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            },
            numpad: {
                inputMatch: [ROT.VK_NUMPAD8, ROT.VK_UP],
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            }
        },
        TURN_UR: {
            waxd: {
                inputMatch: ROT.VK_E,
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD9,
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            }
        },
        TURN_LEFT: {
            waxd: {
                inputMatch: [ROT.VK_A, ROT.VK_LEFT],
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            },
            numpad: {
                inputMatch: [ROT.VK_NUMPAD4, ROT.VK_LEFT],
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            }
        },
        TURN_STILL: {
            waxd: {
                inputMatch: ROT.VK_S,
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD5,
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            }
        },
        TURN_RIGHT: {
            waxd: {
                inputMatch: [ROT.VK_D, ROT.VK_RIGHT],
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            },
            numpad: {
                inputMatch: [ROT.VK_NUMPAD6, ROT.VK_RIGHT],
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            }
        },
        TURN_DL: {
            waxd: {
                inputMatch: ROT.VK_Z,
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD1,
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            }
        },
        TURN_DOWN: {
            waxd: {
                inputMatch: [ROT.VK_X, ROT.VK_DOWN],
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            },
            numpad: {
                inputMatch: [ROT.VK_NUMPAD2, ROT.VK_DOWN],
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            }
        },
        TURN_DR: {
            waxd: {
                inputMatch: ROT.VK_C,
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD3,
                inputType: 'keydown',
                inputShift: true,
                inputCtrl: false
            }
        },

        MOVE_UL: {
            waxd: {
                inputMatch: ROT.VK_Q,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD7,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_UP: {
            waxd: {
                inputMatch: [ROT.VK_W, ROT.VK_UP],
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: [ROT.VK_NUMPAD8, ROT.VK_UP],
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_UR: {
            waxd: {
                inputMatch: ROT.VK_E,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD9,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_LEFT: {
            waxd: {
                inputMatch: [ROT.VK_A, ROT.VK_LEFT],
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: [ROT.VK_NUMPAD4, ROT.VK_LEFT],
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_STILL: {
            waxd: {
                inputMatch: ROT.VK_S,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD5,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_RIGHT: {
            waxd: {
                inputMatch: [ROT.VK_D, ROT.VK_RIGHT],
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: [ROT.VK_NUMPAD6, ROT.VK_RIGHT],
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_DL: {
            waxd: {
                inputMatch: ROT.VK_Z,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD1,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_DOWN: {
            waxd: {
                inputMatch: [ROT.VK_X, ROT.VK_DOWN],
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: [ROT.VK_NUMPAD2, ROT.VK_DOWN],
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        MOVE_DR: {
            waxd: {
                inputMatch: ROT.VK_C,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            },
            numpad: {
                inputMatch: ROT.VK_NUMPAD3,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },

        NEXT_LEVEL: {
            all: {
                inputMatch: ROT.VK_GREATER_THAN,
                inputType: 'keypress',
                inputShift: true,
                inputCtrl: false
            }
        },
        PREVIOUS_LEVEL: {
            all: {
                inputMatch: ROT.VK_LESS_THAN,
                inputType: 'keypress',
                inputShift: true,
                inputCtrl: false
            }
        },

        INVENTORY: {
          all: {
              inputMatch: ROT.VK_I,
              inputType: 'keydown',
              inputShift: false,
              inputCtrl: false
          }
        },
        EQUIPMENT: {
          all: {
              inputMatch: ROT.VK_I,
              inputType: 'keydown',
              inputShift: true,
              inputCtrl: false
          }
        },
        INTERACT: {
          all: {
              inputMatch: ROT.VK_SPACE,
              inputType: 'keypress',
              inputShift: false,
              inputCtrl: false
          }
        },

        CHANGE_BINDINGS: {
            all: {
                inputMatch: ROT.VK_BACK_SLASH,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        CONFIRM: {
            all: {
                inputMatch: ROT.VK_RETURN,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        },
        CANCEL: {
            all: {
                inputMatch: ROT.VK_ESCAPE,
                inputType: 'keydown',
                inputShift: false,
                inputCtrl: false
            }
        }

    }
};
