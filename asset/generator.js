Game.Generator = function(gName, constructfn, defaultTemplate){
  this._name = gName;
  this._templates = {};
  this._constructfn = constructfn;
  this._templates._DEFAULT = defaultTemplate || {};
};

Game.Generator.prototype.learn = function(template, key){
  if (!template.name && !key) {
    console.log('template needs name or key');
    return false;
  }
  key = key || template.name;
  this._templates[key] = template;
};

Game.Generator.prototype.create = function(key, id){
  var template = this._templates[key];
  if (id) { template.presetID = id; }
  if (!template) { template = '_DEFAULT'; }
  template._generator_key = key;
  return new this._constructfn(template);
};
