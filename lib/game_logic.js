Carre.GameLogic = {
  objectByFamily : {},
  objects : [],
  eachFrame : [],
  world : {
    gravity :1,
    friction : 0.5
  },
  last_render_time : 0,

  create: function(name, desc) {
    var o = new GameObject( Util.extend({}, this.gameObjects[name], desc) );
    for (var i in o.families) {
      if (this.objectByFamily[o.families[i]] === undefined) {
        this.objectByFamily[o.families[i]] = [];
      }
      this.objectByFamily[o.families[i]].push(o);
    }
    this.objects.push(o);
    return o;
  },

  get: function(family) {
    return this.objectByFamily[family];
  },

  // Used when changing the level : remove all the object from the world.
  // Use this only when the event loop is stopped.
  cleanWorld : function() {
    this.objectByFamily = {};
    this.objects = [];
  },
  placeGameObjects : function() {
    var player = this.create("player"),
        camera = this.create("camera");

    // load a first particle
    this.create("particle", {opacity: 0});
  },

  // holds the box collision results
  boxCollisions : {},

  onBoxCollision : function(f1,f2) {
    if ( !this.boxCollisions.f1){
      this.boxCollisions.f1 = { f2 : [] };
    }
    else if (!this.boxCollisions.f1.f2){
      this.boxCollisions.f1.f2 = [];
    }
    return this.boxCollisions.f1.f2;
  },

  processBoxCollisions : function(elpasedTime) {
    var objByFamily = Carre.gameLogic.objectByFamily;
    for( var f1 in this.boxCollisions ){
      for( var obj1 in objByFamily[f1] ){
        for( var f2 in this.boxCollisions[f1] ){
          for( var obj2 in objByFamily[f2] ){
            if( boxCollisionTest( objByFamily.obj1, objByFamily.obj2 ) ){
              for( var cb in boxCollision.f1.f2 ){
                cb( objByFamily.obj1, objByFamily.f2, elapsedTime );
              }
            }
          }
        }
      }
    }
  },

  boxCollisionTest : function ( box1, box2 ) {
      var ax1 = box1.x,
          ax2 = box1.x + box1.width,
          bx1 = box2.x,
          bx2 = box2.x + box2.width,
          ay1 = box1.y,
          ay2 = box1.y + box1.height,
          by1 = box2.y,
          by2 = box2.y + box2.height;
      return (
          (ax2 > bx1) && (bx2 > ax1)
          &&(ay2 > by1) && (by2 > ay1)
      );
  },

  init : function() {
    var _this = this;

    this.eachFrame.push(function(elapsedTime) {
      for(var i = 0; i < _this.objectByFamily.physical.length; i++) {
        var o = _this.objectByFamily.physical[i],
            cp = o.collisionPoints,
            collision;
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

        collision = cp.head2.state ? "head" :
          cp.right2.state ? "right" :
          cp.feet2.state ? "feet" :
          cp.left2.state ? "left" : false;
        o.collided = collision != o.lastCollision && collision;
        o.lastCollision = collision;

        o.x += o.vx;
        o.y += o.vy;
      }
    });

    // Wall grinding
    this.eachFrame.push(function(elapsedTime) {
      var player = Carre.GameLogic.get("player")[0];

      if ((player.collisionPoints.right2.state >= 0 &&
           Carre.Inputs.isKeyDown(39)) ||
          (player.collisionPoints.left2.state >= 0 &&
          Carre.Inputs.isKeyDown(37))) {
        player.vy = Math.min(player.vy, 3);
      }
    });

    this.eachFrame.push(function(elapsedTime) {
      var dx = _this.objectByFamily.camera[0].x - _this.objectByFamily.player[0].x + Carre.settings.width / 2;
      var dy = _this.objectByFamily.camera[0].y - _this.objectByFamily.player[0].y + Carre.settings.height / 2;
      _this.objectByFamily.camera[0].x -= Math.floor(dx / 10);
      _this.objectByFamily.camera[0].y -= Math.floor(dy / 10);
    });

    this.eachFrame.push(function(elapsedTime) {
      var p = _this.objectByFamily.player[0],
          i = 10;
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

      // create 10 particles in a single frame if a collision just occured
      if ( p.collided ) {
        while ( i-- ) { Util.addParticle( _this, p, p.collisionPoints.head1, p.collided ); }

      // create approx 1 particle every 5 frames otherwise
      } else if ( Math.random() * 5 > 4 ) {
        Util.addParticle( _this, p, p.collisionPoints.head1, p.collided );
      }
    });

    this.eachFrame.push(function(elapsedTime) {
      _this.objectByFamily.particle && _this.objectByFamily.particle.forEach(function( prt, i ) {
        prt.x += prt.vx;
        prt.y += prt.vy;

        prt.vy -= .0125;
        prt.width -= .5;
        prt.height -= .5;
        prt.opacity -= .025;

        if ( prt.opacity < .05 ) {
          prt.destroy();
        }
      });
    });

    this.eachFrame.push(function(elapsedTime) {
      _this.objectByFamily.killable.forEach(function(e) {
        if (e.y > 1000) {
          e.destroy.bind(e)();
          Carre.GameLogic.create("player");
        }
      });
    });

    // Verify the player doesn't touch a color other than his, and kill him if so
    this.eachFrame.push(function(elapsedTime) {
      var player = Carre.GameLogic.objectByFamily.player[0];
      if (typeof player !== "undefined" && (
            player.collisionPoints.feet2.state >= 0 &&
            player.color !== player.collisionPoints.feet2.state
          ) || (
            player.collisionPoints.head2.state >= 0 &&
            player.color !== player.collisionPoints.head2.state
          ) || (
            player.collisionPoints.left2.state >= 0 &&
            player.color !== player.collisionPoints.left2.state
          ) || (
            player.collisionPoints.right2.state >= 0 &&
            player.color !== player.collisionPoints.right2.state
          )) {
        // DIE, PLAYER, DIE!!!
        player.destroy();
        Carre.GameLogic.create("player");
      }
    });

    // Register all input bindings

    // Pause on p
    Carre.Inputs.register.bind(Carre.Inputs)(80, "down", "async", function pause() {
      console.log("pressed");
      Carre.paused = !Carre.paused;
      Carre.Menu.showHidePauseLabel();
    });

    Carre.Inputs.register.bind(Carre.Inputs)(37, "pressed", "sync", function left() {
      var p = Carre.GameLogic.objectByFamily.player[0];
      p.look = "left";
      p.displayComponent.animation.currentAnimation = p.displayComponent.animation.walking;
      if (Carre.GameLogic.objectByFamily.player[0].collisionPoints.left2.state < 0) {
        var vx = Carre.GameLogic.objectByFamily.player[0].vx;
        vx = Math.max(vx - 0.08 * Carre.GameLogic.elapsedTime, -6);
        Carre.GameLogic.objectByFamily.player[0].vx = vx ;
      }
    });

    Carre.Inputs.register.bind(Carre.Inputs)(39, "pressed", "sync", function right() {
      var p = Carre.GameLogic.objectByFamily.player[0];
      p.look = "right";
      p.displayComponent.animation.currentAnimation = p.displayComponent.animation.walking;
      if (Carre.GameLogic.objectByFamily.player[0].collisionPoints.right2.state < 0) {
        var vx = Carre.GameLogic.objectByFamily.player[0].vx;
        vx = Math.min(vx + 0.08 * Carre.GameLogic.elapsedTime, 6);
        Carre.GameLogic.objectByFamily.player[0].vx = vx ;
      }
    });

    Carre.Inputs.register.bind(Carre.Inputs)(38, "down", "sync", function up() {
      var player = Carre.GameLogic.get("player")[0],
          color = Util.modulo(player.color + 1, Carre.Tile.colorNumber);
      player.color = color;
    });

    Carre.Inputs.register.bind(Carre.Inputs)(40, "down", "sync", function down() {
      var player = Carre.GameLogic.get("player")[0],
          color = Util.modulo(player.color - 1, Carre.Tile.colorNumber);
      player.color = color;
    });

    Carre.Inputs.register.bind(Carre.Inputs)(32, "down", "sync", function jump() {
      var player = Carre.GameLogic.get("player")[0];
      if (Carre.GameLogic.objectByFamily.player[0].collisionPoints.feet2.state >= 0) {
        player.vy -= 15;
        Carre.Sound.trigger("jump");
      } else if (player.collisionPoints.right2.state >= 0) {
        player.vy -= 22;
        player.vx -= 10;
        Carre.Sound.trigger("jump");
      } else if (player.collisionPoints.left2.state >= 0) {
        player.vy -= 22;
        player.vx += 10;
        Carre.Sound.trigger("jump");
      }
    });

    Carre.Inputs.register.bind(Carre.Inputs)(68, "down", "sync", function suicide() {
      Carre.GameLogic.objectByFamily.player[0].destroy();
      Carre.GameLogic.get("player");
    });
  },

  gameObjects : {
    player : {
      displayComponent : Carre.DisplayComponents.Player,
      families : ["player", "physical", "killable"],
      x : 32,
      y : 110,
      color: 0,
      collisionPoints : {
        feet1 : {x : 42, y : 56, state : false},
        feet2 : {x : 42, y : 57, state : false},
        head1 : {x : 42, y : 22, state : false},
        head2 : {x : 42, y : 21, state : false},
        left1 : {x : 27, y : 40, state : false},
        left2 : {x : 25, y : 40, state : false},
        right1 : {x : 61, y : 40, state : false},
        right2 : {x : 63, y : 40, state : false}
      },
      maxspeed : 5,
      friction : 1,
      destroyCallback : function() {
        Carre.Sound.trigger("death");
      }
    },
    particle : {
      displayComponent : Carre.DisplayComponents.Particle,
      families: [ "particle" ]
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
    var elapsedTime = this.elapsedTime = now - this.last_render_time;
    for (var o = 0; o < physical.length; o++) {
      for(var cp in physical[o].collisionPoints) {
        physical[o].collisionPoints[cp].state = this.testCollision(
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
