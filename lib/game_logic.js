Carre.GameLogic = {
  objectByFamily : {},
  objects : [],
  eachFrame : [],
  tick : function() {
    
  },
  get : function(name) {
    var o = new GameObject(this.gameObjects[name]);
    for (var i in o.families) {
      if (this.objectByFamily[o.families[i]] === undefined) {
        this.objectByFamily[o.families[i]] = [];
      }
      this.objectByFamily[o.families[i]].push(o);
    }
    this.objects.push(o);
    return o;
  },
  init : function() {
    var player = this.get("player");
    var camera = this.get("camera");
    this.eachFrame.push(function(elapsedTime) {
      for(var i = 0; i < objectByFamily.physical.length; i++) {
        objectByFamily.physical[i].vy += 1;
      }
    });
  },
  gameObjects : {
    player : {
      displayComponent : Carre.DisplayComponents.Player,
      families : ["player", "physical"],
      x : 32,
      y :210
    },
    camera : {
      displayComponent : null,
      families : ["camera"],
      x : 0,
      y : 0
    }
  },
  render : function(c) {
    for (var i = 0; i < this.objects.length; i++) {
      if (this.objects[i].displayComponent) {
        this.objects[i].displayComponent.display.bind(this.objects[i].displayComponent)(this.objects[i], c);
      }
    }
  },
  testCollision : function(x, y, map) {
    var tx = x / map.tilewidth,
        ty = y / map.tileheight,
        tId = map.layers.data[tx + ty * map.width];
  }
};

