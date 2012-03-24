Carre.GameLogic = {
  objectByFamily : {},
  objects : [],
  eachFrame : [],
  world : {
    gravity :1,
    friction : 0.5
  },
  last_render_time : 0,
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
  // Used when changing the level : remove all the object from the world.
  // Use this only when the event loop is stopped.
  cleanWorld : function() {
    this.objectByFamily = {};
    this.objects = [];
  },
  placeGameObjects : function() {
    var player = this.get("player"),
        camera = this.get("camera");
  },
  init : function() {
    var _this = this;

    this.eachFrame.push(function(elapsedTime) {
      for(var i = 0; i < _this.objectByFamily.physical.length; i++) {
        var o = _this.objectByFamily.physical[i],
            cp = o.collisionPoints;
        o.vy += _this.world.gravity;
        if (cp.feet2.state >= 0 && o.vy > 0) {
          o.vy = 0;
        }

        if (cp.head2.state >= 0 && o.vy < 0) {
          o.vy = 0;
        }

        if (cp.left2.state >= 0 && o.vx < 0) {
          o.vx = 0;
        }

        if (cp.right2.state >= 0 && o.vx > 0) {
          o.vx = 0;
        }
        // When the object is in a clip element.
        if (cp.feet1.state >= 0) {
          o.y -= 4;
        }
        if (cp.left1.state >= 0) {
          o.x += 4;
        }
        if (cp.right1.state >= 0) {
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
    this.eachFrame.push(function(elapsedTime) {
      var p = _this.objectByFamily.player[0];
      if (p.collisionPoints.feet2.state >= 0) {
        if (p.vx !== 0) {
          var direction = p.vx > 0 ? -1 : 1,
              dx = _this.world.friction * p.friction * direction;
          p.vx += dx;
          if (p.vx * p.vx < 0.5) {
            p.vx = 0;
            p.displayComponent.animation.currentAnimation = p.displayComponent.animation.idle;
          }
        }
      }
    });

    this.eachFrame.push(function(elapsedTime) {
      _this.objectByFamily.killable.forEach(function(e) {
        if (e.y > 1000) {
          e.destroy.bind(e)();
          Carre.GameLogic.get("player");
        }
      });
    });
  },
  gameObjects : {
    player : {
      displayComponent : Carre.DisplayComponents.Player,
      families : ["player", "physical", "killable"],
      x : 32,
      y : 110,
      collisionPoints : {
        feet1 : {x : 12, y : 44, state : false},
        feet2 : {x : 12, y : 46, state : false},
        head1 : {x : 12, y : 0, state : false},
        head2 : {x : 12, y : -2, state : false},
        left1 : {x : 6, y : 24, state : false},
        left2 : {x : 0, y : 24, state : false},
        right1 : {x : 18, y : 24, state : false},
        right2 : {x : 20, y : 24, state : false}
      },
      maxspeed : 5,
      friction : 1,
      destroyCallback : function() {
        Carre.Sound.trigger("death");
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

    var now = Date.now();
    if (this.last_render_time === 0) {
      this.last_render_time = now - 10;
    }
    var elapsedTime = now - this.last_render_time;
    for (var o = 0; o < physical.length; o++) {
      for(var cp in physical[o].collisionPoints) {
        physical[o].collisionPoints[cp].state = _this.testCollision(
          physical[o].x + physical[o].collisionPoints[cp].x,
          physical[o].y + physical[o].collisionPoints[cp].y,
          Carre.Tile.layers.solid,
          Carre.Tile.solidMapData
        );
      }
    }

    for (var i = 0; i < this.objects.length; i++) {
      if (this.objects[i].displayComponent) {
        this.objects[i].displayComponent.display.bind(this.objects[i].displayComponent)(this.objects[i], c, elapsedTime);
      }
    }
    if (this.eachFrame) {
      this.eachFrame.forEach(function(f) {
        if (Carre.wasPaused) {
          f(16);
        } else {
          f(elapsedTime);
        }
      });
      Carre.wasPaused = false;
    }
    this.last_render_time = now;
  },
  testCollision : function(x, y, layer, mapData) {
    var tx = Math.floor(x / Carre.Tile.map.tilewidth),
        ty = Math.floor(y / Carre.Tile.map.tileheight),
        id = tx + ty * layer.width,
        tId = layer.data[id],
        tileData = mapData[id];
    if (typeof tId !== "undefined" && tId !== 0 &&
        tx >= 0 && ty >= 0 &&
        tx <= layer.width && ty <= layer.height) {
      return Carre.colorConv[tileData.color];
    }
    return -1;
  }
};

