Carre.Inputs = {
  dispatch : function(key, event) {
    // If the key is already pressed, do not add it again.
    if ( ! this.isKeyDown(key)) {
      this.events[key] = event;
    }

    if (event === "down") {
      this.keysdown[key] = true;
    } else {
      delete this.keysdown[key];
    }

    if (this.handlers[key]) {
      for (var i = 0; i < this.handlers[key].length; i++) {
        this.handlers[event][key][i]();
      }
    }
  },
  isKeyDown : function(key) {
    return this.keysdown[key] === true ? true : false;
  },
  register : function(key, event, callback) {
    if (this.handlers[event][key] === undefined) {
      this.handlers[event][key] = [];
    }
    this.handlers[event][key].push(callback);
  },
  // This is called once per frame, after the rendering.
  process : function() {
    for (var i in this.keysdown) {
      if (this.handlers.pressed[i]) {
        for (var j = 0; j < this.handlers.pressed[i].length; j++) {
          this.handlers.pressed[i][j]();
        }
      }
    }
    var _this = this;
    for (var key in this.events) {
        var e = _this.events[key];
        if (_this.handlers[e][key]) {
          for (var cb = 0; cb < _this.handlers[e][key].length; cb++) {
            _this.handlers[e][key][cb]();
          }
      }
    }
    this.events = {};
  },
  keysdown : {},
  events : {},
  handlers: {
    up : {},
    down : {},
    pressed : {}
  }
};
