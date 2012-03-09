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
    Util.require("lib/util.js", function() {
      Util.require("lib/tile.js", function() {
        Util.require("lib/inputs.js", function() {
          _this.getSettingsFromPage();
          _this.initCanvas.bind(_this)();
          _this.initInputs.bind(_this)();
          _this.Tile.load(Carre.settings.map);
        });
      });
    });
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
    _this.Inputs.register.bind(_this.Inputs)(37, "pressed", function right() {
      _this.settings.x -= 5;
    });
    _this.Inputs.register.bind(_this.Inputs)(39, "pressed", function left() {
      _this.settings.x += 5;
    });
    _this.Inputs.register.bind(_this.Inputs)(38, "pressed", function up() {
      _this.settings.y -= 5;
    });
    _this.Inputs.register.bind(_this.Inputs)(40, "pressed", function down() {
      _this.settings.y += 5;
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


    (function animloop(){
      requestAnimFrame(animloop);
      Carre.c.clearRect(0, 0, Carre.settings.width, Carre.settings.height);
      Carre.Inputs.process.bind(Carre.Inputs)();
      Carre.Tile.renderMap(Carre.settings.x, Carre.settings.y);
    })();
    // place the rAF *before* the render() to assure as close to 
    // 60fps with the setTimeout fallback.
  },
  notifyLoaded : function(module) {
    this.loadingState[module] = true;
    for (var i in this.loadingState) {
      if (this.loadingState === false) {
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
    tileset : false
  }
};

