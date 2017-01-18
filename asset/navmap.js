//from: http://stackoverflow.com/questions/237104/array-containsobj-in-javascript

Array.prototype.contains = function(name) {
  let i = this.length;
  while (i--) {
    if (this[i].name === name) {
      return true;
    }
  }
  return false;
};

function Node(attr) {
  this.edge_list = [];
  this.name = attr.name;
  this.mapType = attr.mapType;
  this.starSystem = attr.starSystem;
  this.prefix = attr.prefix;
  this.navNum = '0';
};

Node.prototype.addEdge = function(end) {
  this.edge_list.push(end);
};

function Graph(node_list) {
  this.node_list = node_list || [];
  this.star_systems = [];
};

Graph.prototype.addStarSystem = function(system_name){
  this.star_systems.push(system_name);
}

Graph.prototype.getNextStarSystem = function(system_name){
  var ind = this.star_systems.indexOf(system_name);
  var res = this.star_systems[ind+1];
  return (res)?res:false;
}

Graph.prototype.addEdge = function(start, end) {
  const first = this.node_list.contains(start.name);
  const second = this.node_list.contains(end.name);

  if(first){
    //get start node
    var i = this.node_list.length;
    while (i--) {
      if (this.node_list[i].name === start.name) {
        this.node_list[i].addEdge(end);
        break;
      }
    }
  }
  if(second){
    //get end node
    i = this.node_list.length;
    while (i--) {
      if (this.node_list[i].name === end.name) {
        this.node_list[i].addEdge(start);
        break;
      }
    }
  }

  if( (!first) || (!second) ){
    if( !first ){
      const node = new Node(start);
      node.addEdge(end);
      this.node_list.push(node);
    }
    if( !second ){
      const node = new Node(end);
      node.addEdge(start);
      this.node_list.push(node);
    }
  }
};

Graph.prototype.printNodes = function() {
  for(var i = 0;i < this.node_list.length;i++){
    console.log(this.node_list[i].name +":");
    console.log(this.node_list[i].edge_list);
  }
};

Graph.prototype.addNode = function(node){
  this.node_list.push(new Node(node));
};

Graph.prototype.getNode = function(name) {
  for(var i = 0;i < this.node_list.length;i++){ //iterate over all nodes
    if(this.node_list[i].name.localeCompare(name)==0){ //if the node has the given name
      return this.node_list[i];
    }
  }
  console.log('no node with name ' + name)
  return false;
};
