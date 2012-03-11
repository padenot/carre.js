Carre.GameLogic = {
  objectByFamily : {},
  objects : [],
  eachFrame : [],
  world : {
    gravity :1
  },
  last_render_time : 0,
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
    var _this = this;
        player = this.get("player");
        camera = this.get("camera");

    this.eachFrame.push(function(elapsedTime) {
      for(var i = 0; i < _this.objectByFamily.physical.length; i++) {
        var o = _this.objectByFamily.physical[i],
            cp = o.collisionPoints;
        o.vy += _this.world.gravity;
        if (cp.feet2.state &&
            o.vy > 0) {
          o.vy = 0;
        }

        if (cp.head2.state &&
            o.vy < 0) {
          o.vy = 0;
        }

        if (cp.left2.state &&
            o.vx < 0) {
          o.vx = 0;
        }

        if (cp.right2.state &&
            o.vx > 0) {
          o.vx = 0;
        }
        // When the object is in a clip element.
        if (cp.feet1.state === true) {
          o.y -= 4;
        }
        if (cp.left1.state === true) {
          o.x += 4;
        }
        if (cp.right1.state === true) {
          o.x -= 4;
        }
        o.x += o.vx;
        o.y += o.vy;
      }
    });
    this.eachFrame.push(function(elapsedTime) {
      var dx = _this.objectByFamily.camera[0].x - _this.objectByFamily.player[0].x + Carre.settings.width / 2;
      var dy = _this.objectByFamily.camera[0].y - _this.objectByFamily.player[0].y + Carre.settings.height / 2;
      _this.objectByFamily.camera[0].x -= Math.floor(dx / 10);
      _this.objectByFamily.camera[0].y -= Math.floor(dy / 10);
    });
  },
  gameObjects : {
    player : {
      displayComponent : Carre.DisplayComponents.Player,
      families : ["player", "physical"],
      x : 32,
      y : 110,
      collisionPoints : {
        feet1 : {x : 12, y : 48, state : false},
        feet2 : {x : 12, y : 50, state : false},
        head1 : {x : 12, y : 0, state : false},
        head2 : {x : 12, y : -4, state : false},
        left1 : {x : 0, y : 24, state : false},
        left2 : {x : -4, y : 24, state : false},
        right1 : {x : 24, y : 24, state : false},
        right2 : {x : 28, y : 24, state : false}
      }
    },
    camera : {
      displayComponent : null,
      families : ["camera"],
      x : 0,
      y : 0
    }
  },
  render : function(c) {
    var _this = this,
        physical = this.objectByFamily.physical;
    for (var o = 0; o < physical.length; o++) {
      for(var cp in physical[o].collisionPoints) {
        physical[o].collisionPoints[cp].state = _this.testCollision(physical[o].x + physical[o].collisionPoints[cp].x, physical[o].y + physical[o].collisionPoints[cp].y, Carre.Tile.map);
      }
    }

    for (var i = 0; i < this.objects.length; i++) {
      if (this.objects[i].displayComponent) {
        this.objects[i].displayComponent.display.bind(this.objects[i].displayComponent)(this.objects[i], c);
      }
    }
    if (this.eachFrame) {
      var now = Date().now;
      if (this.last_render_time === 0) {
        this.last_render_time = now - 10;
      }
      this.eachFrame.forEach(function(f) {
        f(now - _this.last_render_time);
      });
      last = now;
    }
  },
  testCollision : function(x, y, map) {
    var tx = Math.floor(x / map.tilewidth),
        ty = Math.floor(y / map.tileheight),
        tId = map.layers[0].data[tx + ty * map.width];
    if (Carre.Tile.collision[tId] != "noclip" && Carre.Tile.collision[tId] !== undefined) {
      return true;
    }
    return false;
  }
};

