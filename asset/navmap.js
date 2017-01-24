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
  this.navNum = attr.navNum;
  this.visited = false;
};

Node.prototype.addEdge = function(end) {
  this.edge_list.push(end.name);
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


Graph.prototype.addEdge = function(start,end){
  var first = this.getNode(start.name);
  var second = this.getNode(end.name);

  start.addEdge(end);
  end.addEdge(start);
};

Graph.prototype.randomizeEdges = function(){
  var numNodes = this.node_list.length;
  for (var i=0; i < numNodes; i++){
    var curNode = this.node_list[i];
    for (var j=i+1; j < numNodes; j++){
      var nextNode = this.node_list[j];
      if (ROT.RNG.getUniform() >= 0.5){
        this.addEdge(curNode,nextNode);
        Game.UIMode.navigation.attr._L[nextNode.navNum + curNode.navNum] = '*';
      }
    }
  }
}

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
