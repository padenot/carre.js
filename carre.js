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
                    Util.require("lib/sound.js", function() {
                      // initialize sound (preload assets and such).
                      Carre.Sound.init.bind(Carre.Sound)();
                      // Initialize the game logic and stuff
                      Carre.GameLogic.init.bind(Carre.GameLogic)();
                      // Load the first level

                      _this.loadLevel(true);
                      Carre.Sound.trigger("title");

                      // set modal position
                      var canvas = document.getElementById("CarreCanvas"),
                        canvasTop = canvas.offsetTop,
                        canvasLeft = canvas.offsetLeft,
                        canvasWidth = canvas.width,
                        canvasHeight = canvas.height;
                      var modalStyle = document.getElementById("credits").style,
                        curtainStyle = document.getElementById("curtain").style,
                        scoreStyle = document.getElementById("score").style;

                      modalStyle.top = canvasTop + 150 + "px";
                      modalStyle.left = canvasLeft + 150 + "px";
                      scoreStyle.top = canvasTop + 150 + "px";
                      scoreStyle.left = canvasLeft + 150 + "px";
                      curtainStyle.top = canvasTop + "px";
                      curtainStyle.left = canvasLeft + "px";
                      curtainStyle.width = canvasWidth + "px";
                      curtainStyle.height = canvasHeight + "px";
                    });
                  });
                });
              });
            });
          });
        });
      });
  },
  loadLevel : function(preload) {
    var level = Carre.settings.levels[this.currentLevel];
    console.log("Loading level " + level.name);
    // Load the tileset and the collision file for this level.
    Carre.Tile.load.bind(Carre.Tile)(level.map);
    // Initialize the game logic
    Carre.GameLogic.placeGameObjects.bind(Carre.GameLogic)();
    if (!preload) {
      this.startLevel();
    }
  },
  startLevel : function() {
    Carre.Sound.trigger(Carre.settings.levels[this.currentLevel].soundtrack);
    Carre.Sound.trigger("start");
    Carre.GameLogic.objectByFamily.timer[0].loadLevelTime = Date.now();
  },
  levelWon : function() {
    Carre.Sound.trigger("win");
    this.pauseGameLoop();
    this.Sound.fadeToSilence();
    Util.fade( "curtain", 0.5 );

    Util.toggleFade( "score", 1 );

    // Remove all things from the world (player, objects, etc.).
    this.GameLogic.cleanWorld();
    this.currentLevel++;
    if (Carre.settings.levels[this.currentLevel] === undefined) {
      this.gameWon();
      return;
    }
    var _this = this
      , levelStart = function() {
      _this.loadLevel();
      _this.startLevel();
      _this.unpauseGameLoop();
      Util.fade( "curtain", 0 );
      Util.toggleFade( "score" );
    };

    document.getElementById("clooooose").onclick = levelStart;
    Carre.Inputs.registerUniqueOnKeyDown(levelStart);
  },
  gameWon : function() {
    console.log("the game has been won.");
    var curtain = document.getElementById("curtain");
    curtain.innerHTML = "You Won !";
    Util.c(curtain, "add", "bigFatHotPink");
  },
  play : function() {
    document.querySelector("#menu").style.disabled = true;
    if (Carre.isPlaying) {
      // Wtf ?
      return;
    }

    if (this.currentLevel === 0) {
      Carre.Sound.fadeToSilence();
      this.startLevel();
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
      Carre.Tile.renderMap.bind(Carre.Tile)(camera.x, camera.y);
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
    if (! this.loaded) {
      Carre.Menu.notifyLoadingFinished();

      if (Carre.settings.autoplay) {
        Carre.play();
      }
    }
    this.loaded = true;
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
    sounds : false,
    backdrop : false,
    vignette : false,
    particle : false,
    cpu : false
  },
  loaded : false
};
