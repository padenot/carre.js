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
        _this.initCanvas.bind(_this)();
        _this.getSettingsFromPage();
        _this.Tile.load(Carre.settings.map);
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
  settings : {
    width : 448,
    height : 320,
    map : "map.json",
    debug : true
  }
};

