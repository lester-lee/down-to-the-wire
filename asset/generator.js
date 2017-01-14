Game.Generator = function(gName, constructfn, defaultTemplate){
  this._name = gName;
  this._templates = {};
  this._constructfn = constructfn;
  this._templates._DEFAULT = defaultTemplate || {};
};

Game.Generator.prototype.learn = function(template, key){
  if (!template.name) {
    console.log('template needs name attr');
    return false;
  }
  key = key || template.name;
  this._templates[key] = template;
};

Game.Generator.prototype.create = function(key){
  var template = this._templates[key];
  if (!template) { template = '_DEFAULT'; }
  template._generator_key = key;
  return new this._constructfn(template);
};
