var Util = {
  log : function(msg) {
    if (Carre.settings.debug) {
      console.log(msg);
    }
  },
  require : function(filename, callback) {
    var node = document.createElement('script');
    node.setAttribute('type', 'text/javascript');
    node.setAttribute('charset', 'utf-8');
    node.setAttribute('src', filename);
    node.addEventListener('load', function() {
      Util.log("Loading " + filename);
      callback();
    });
    var head = document.getElementsByTagName('head')[0];
    head.appendChild(node);
  }
};

var Carre = {
  init : function() {
    var _this = this;
    this.startLoading();
    Util.require("lib/util.js", function() {
      Util.require("lib/tile.js", function() {
        Util.require("lib/inputs.js", function() {
          Util.require("lib/game_object.js", function() {
            Util.require("lib/display_components.js", function() {
              Util.require("lib/game_logic.js", function() {
                Util.require("lib/sound.js", function() {
                _this.getSettingsFromPage();
                _this.initCanvas();
                _this.initInputs();
                Carre.Tile.load.bind(Carre.Tile)(Carre.settings.map, Carre.settings.collision);
                Carre.Sound.init.bind(Carre.Sound)();

                _this.GameLogic.init.bind(_this.GameLogic)();
                });
              });
            });
          });
        });
      });
    });
  },
  startLoading : function() {
    document.getElementsByTagName("canvas");
  },
  getSettingsFromPage : function() {
    for (var i in GameConfig) {
      Carre.settings[i] = GameConfig[i];
    }
  },
  initCanvas : function() {
    var cvs = document.getElementById("CarreCanvas");
    cvs.width = this.settings.width;
    cvs.height = this.settings.height;
    this.c = cvs.getContext("2d");
  },
  initInputs : function() {
    var _this = this;
    document.onkeydown = function(e) {
      _this.Inputs.dispatch(e.keyCode, "down");
    };
    document.onkeyup = function(e) {
      _this.Inputs.dispatch(e.keyCode, "up");
    };

    this.Inputs.register.bind(this.Inputs)(37, "pressed", function left() {
      var p = Carre.GameLogic.objectByFamily.player[0];
      p.look = "left";
      p.displayComponent.animation.currentAnimation = p.displayComponent.animation.walking;
      if (Carre.GameLogic.objectByFamily.player[0].collisionPoints.right2.state !== true) {
        var vx = Carre.GameLogic.objectByFamily.player[0].vx;
        Carre.GameLogic.objectByFamily.player[0].vx = Math.min(vx, -5) ;
      }
    });
    this.Inputs.register.bind(this.Inputs)(39, "pressed", function right() {
      var p = Carre.GameLogic.objectByFamily.player[0];
      p.look = "right";
      p.displayComponent.animation.currentAnimation = p.displayComponent.animation.walking;
      if (Carre.GameLogic.objectByFamily.player[0].collisionPoints.left2.state !== true) {
        var vx = Carre.GameLogic.objectByFamily.player[0].vx;
        Carre.GameLogic.objectByFamily.player[0].vx = Math.max(vx, 5) ;
      }
    });
    this.Inputs.register.bind(this.Inputs)(38, "pressed", function up() {
    });
    this.Inputs.register.bind(this.Inputs)(40, "pressed", function down() {
    });
    this.Inputs.register.bind(this.Inputs)(32, "down", function jump() {
      if (Carre.GameLogic.objectByFamily.player[0].collisionPoints.feet2.state === true) {
        Carre.GameLogic.objectByFamily.player[0].vy -= 15;
        Carre.Sound.trigger("jump");
      }
    });
    this.Inputs.register.bind(this.Inputs)(75, "down", function suicide() {
      Carre.GameLogic.objectByFamily.player[0].destroy();
      Carre.GameLogic.get("player");
    });
  },
  gameLoop : function() {
    // shim layer with setTimeout fallback
    window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

    Carre.Sound.trigger("music");

    (function animloop(){
      requestAnimFrame(animloop);
      Carre.c.fillStyle = "rgba(50,50,255,1)";
      Carre.c.fillRect(0,0,Carre.settings.width, Carre.settings.height);
      //Carre.c.clearRect(0, 0, Carre.settings.width, Carre.settings.height);
      var camera = Carre.GameLogic.objectByFamily.camera[0];
      Carre.Tile.renderMap(camera.x, camera.y);
      Carre.GameLogic.render.bind(Carre.GameLogic)(Carre.c);
      Carre.Inputs.process.bind(Carre.Inputs)();
    })();
    // place the rAF *before* the render() to assure as close to 
    // 60fps with the setTimeout fallback.
  },
  notifyLoaded : function(module) {
    this.loadingState[module] = true;
    for (var i in this.loadingState) {
      if (this.loadingState[i] === false) {
        return;
      }
    }
    this.gameLoop();
  },
  settings : {
    width : 400,
    height : 300,
    map : "map.json",
    debug : true,
    x : 0,
    y : 0
  },
  loadingState : {
    tileset : false,
    player : false,
    collision : false,
    sounds : false
  }
};
