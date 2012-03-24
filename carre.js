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

    var _this = this;
    this.startLoading();

    Util.require("lib/menu.js", function() {
      _this.getSettingsFromPage();
      _this.initCanvas();
      _this.Menu.init();
      _this.Menu.show();
      Util.require("lib/util.js", function() {
        Util.require("lib/tile.js", function() {
          Util.require("lib/inputs.js", function() {
            _this.initInputs();
            Util.require("lib/game_object.js", function() {
              Util.require("lib/display_components.js", function() {
                Util.require("lib/game_logic.js", function() {
                  Util.require("lib/knob.js/knob.js", function() {
                    Util.require("lib/sound.js", function() {
                      // initialize sound (preload assets and such).
                      Carre.Sound.init.bind(Carre.Sound)();
                      // Initialize the game logic and stuff
                      Carre.GameLogic.init.bind(Carre.GameLogic)();
                      // Load the first level
                      _this.loadLevel();

                      var c = {
                        min: 0,
                        max: 2,
                        increment: 0.05,
                        width: 50,
                        height: 50,
                        progression: "linear",
                        type: "circular"
                      };
                      var k = new Knob(document.getElementById('gravity'), c);
                      k.onValueChange(function(v) {
                        console.log(v);
                        Carre.GameLogic.world.gravity = v;
                      });

                      var j = new Knob(document.getElementById('friction'), c);
                      j.onValueChange(function(v) {
                        console.log(v);
                        Carre.GameLogic.world.friction = v;
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  },
  loadLevel : function() {
    var level = Carre.settings.levels[this.currentLevel];
    console.log("Loading level " + level.name);
    // Load the tileset and the collision file for this level.
    Carre.Tile.load.bind(Carre.Tile)(level.map, level.collision);
    // Initialize the game logic
    Carre.GameLogic.placeGameObjects.bind(Carre.GameLogic)();
    Carre.Sound.trigger("level" + this.currentLevel);
  },
  levelWon : function() {
    this.pauseGameLoop();
    this.fadeToBlack();
    this.Sound.fadeToSilence();
    // Remove all things from the world (player, objects, etc.).
    this.GameLogic.cleanWorld();
    this.currentLevel++;
    if (Carre.settings.levels[this.currentLevel] === undefined) {
      this.gameWon();
      return;
    }
    this.loadLevel();
    var _this = this;
    setTimeout(function() {
      _this.unpauseGameLoop();
      _this.fadeToTransparent();
    }, 2000);
  },
  gameWon : function() {
    console.log("the game has been won.");
    var curtain = document.getElementById("curtain");
    curtain.innerHTML = "You Won !";
    Util.c(curtain, "add", "bigFatHotPink");
  },
  fadeToBlack : function() {
    var curtain = document.getElementById("curtain");
    curtain.style.width = Carre.settings.width + "px";
    curtain.style.height = Carre.settings.height + "px";
    var c = document.getElementsByTagName('canvas')[0];
    curtain.style.top = c.offsetTop + "px";
    curtain.style.left = c.offsetLeft + "px";
    document.getElementById("curtain").className = "fadedToBlack";
  },
  fadeToTransparent : function() {
    document.getElementById("curtain").className = "";
  },
  play : function() {
    document.querySelector("#menu").style.disabled = true;
    if (Carre.isPlaying) {
      // Wtf ?
      return;
    }
    this.gameLoop();
  },
  startLoading : function() {
    // XXX progress bar
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
      if (_this.Inputs.registered.indexOf(e.keyCode) !== -1)
        return false;
    };
    document.onkeyup = function(e) {
      _this.Inputs.dispatch(e.keyCode, "up");
    };

    // Pause on p
    this.Inputs.register.bind(this.Inputs)(80, "down", "async", function pause() {
      console.log("pressed");
      Carre.paused = !Carre.paused;
      Carre.Menu.showHidePauseLabel();
    });

    this.Inputs.register.bind(this.Inputs)(37, "pressed", "sync", function left() {
      var p = Carre.GameLogic.objectByFamily.player[0];
      p.look = "left";
      p.displayComponent.animation.currentAnimation = p.displayComponent.animation.walking;
      if (Carre.GameLogic.objectByFamily.player[0].collisionPoints.left2.state < 0) {
        var vx = Carre.GameLogic.objectByFamily.player[0].vx;
        Carre.GameLogic.objectByFamily.player[0].vx = Math.min(vx, -5) ;
      }
    });
    this.Inputs.register.bind(this.Inputs)(39, "pressed", "sync", function right() {
      var p = Carre.GameLogic.objectByFamily.player[0];
      p.look = "right";
      p.displayComponent.animation.currentAnimation = p.displayComponent.animation.walking;
      if (Carre.GameLogic.objectByFamily.player[0].collisionPoints.right2.state < 0) {
        var vx = Carre.GameLogic.objectByFamily.player[0].vx;
        Carre.GameLogic.objectByFamily.player[0].vx = Math.max(vx, 5) ;
      }
    });
    this.Inputs.register.bind(this.Inputs)(38, "pressed", "sync", function up() {
    });
    this.Inputs.register.bind(this.Inputs)(40, "pressed", "sync", function down() {
    });
    this.Inputs.register.bind(this.Inputs)(32, "down", "sync", function jump() {
      if (Carre.GameLogic.objectByFamily.player[0].collisionPoints.feet2.state >= 0) {
        Carre.GameLogic.objectByFamily.player[0].vy -= 15;
        Carre.Sound.trigger("jump");
      }
    });
    this.Inputs.register.bind(this.Inputs)(68, "down", "sync", function suicide() {
      Carre.GameLogic.objectByFamily.player[0].destroy();
      Carre.GameLogic.get("player");
    });
    //this.Inputs.register.bind(this.Inputs)(82, "down", function startRecord() {
      //Carre.Inputs.startRecord.bind(Carre.Inputs)();
    //});
    //this.Inputs.register.bind(this.Inputs)(83, "down", function startRecord() {
      //Carre.Inputs.stopRecord.bind(Carre.Inputs)();
    //});
    //this.Inputs.register.bind(this.Inputs)(80, "down", function replayLast() {
      //Carre.Inputs.replayLast.bind(Carre.Inputs)();
    //});
  },
  replayLoop : function(r) {
    Carre.Sound.trigger("music");

    var replay = r,
        startTime = Date.now(),
        i = 0;
    (function replayloop(){
      if (replay[i].timestamp < Date.now() - startTime) {
        Carre.Inputs.simulateKeypress.bind(Carre.Inputs)(replay[i].timestamp);
        i++;
      }
      if (i !== replay.length) {
        requestAnimFrame(replayloop);
      } else {
        setTimeout(function() {
          Carre.Inputs.simulateKeypress.bind(Carre.Inputs)(75);
        }, 1000);
      }
      Carre.c.clearRect(0, 0, Carre.settings.width, Carre.settings.height);
      var camera = Carre.GameLogic.objectByFamily.camera[0];
      Carre.Tile.renderMap(camera.x, camera.y);
      Carre.GameLogic.render.bind(Carre.GameLogic)(Carre.c);
    })();
  },
  gameLoop : function() {
    console.log("GAMELOOP");
    Carre.Menu.hide();
    Carre.isPlaying = true;

    (function animloop(){
      if (!Carre.paused) {
        requestAnimFrame(animloop);
      } else {
        Carre.wasPaused = true;
        setTimeout(animloop, 100);
        return;
      }
      //Carre.c.fillStyle = "rgba(50,50,255,1)";
      //Carre.c.fillRect(0,0,Carre.settings.width, Carre.settings.height);
      Carre.c.clearRect(0, 0, Carre.settings.width, Carre.settings.height);
      var camera = Carre.GameLogic.objectByFamily.camera[0];
      Carre.Tile.renderMap(camera.x, camera.y);
      Carre.GameLogic.render.bind(Carre.GameLogic)(Carre.c);
      Carre.Inputs.process.bind(Carre.Inputs)();
    })();
  },
  pauseGameLoop : function() {
    Carre.paused = true;
  },
  unpauseGameLoop : function() {
    Carre.paused = false;
  },
  notifyLoaded : function(module) {
    this.loadingState[module] = true;
    for (var i in this.loadingState) {
      if (this.loadingState[i] === false) {
        return;
      }
    }
    Carre.Menu.notifyLoadingFinished();

    if (Carre.settings.autoplay) {
      Carre.play();
    }
  },
  currentLevel : 0,
  settings : {
    width : 400,
    height : 300,
    debug : true,
    x : 0,
    y : 0
  },
  loadingState : {
    tileset : false,
    player : false,
    collision : false,
    sounds : false,
    backdrop : false,
    particle : false
  }
};
