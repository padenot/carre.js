Carre.Inputs = {
  dispatch : function(key, event) {
    if (this.async[key] !== undefined && event === "down") {
      this.async[key]();
      return;
    }
    // If the key is already pressed, do not add it again.
    if ( ! this.isKeyDown(key)) {
      this.events[key] = event;
    }

    if (event === "down") {
      this.keysdown[key] = true;
    } else {
      delete this.keysdown[key];
    }

    if (this.isRecording && this.recordings[this.recordings.length - 1] !== 0) {
      this.recordings[this.recordings.length - 1].push({"event" : key, "timestamp" : Date.now() - this.startTime});
    }

    if (this.handlers[key]) {
      for (var i = 0; i < this.handlers[key].length; i++) {
        this.handlers[event][key][i]();
      }
    }
  },
  simulateKeypress : function(key) {
    this.dispatch(key, "down");
  },
  replayLast : function(key) {
    Carre.stopGameLoop();
    Carre.replayLoop(this.recordings[0]);
  },
  isKeyDown : function(key) {
    return this.keysdown[key] === true ? true : false;
  },
  register : function(key, event, mode, callback) {
    this.registered.push(key);
    if (mode === "async") {
      this.async[key] = callback;
      return;
    }
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
  startRecord : function() {
    if (this.isRecording)
      return;
    this.isRecording = true;
    this.startTime = Date.now();
    var i = this.recordings.length;
    this.recordings[i] = [];
    this.recordings[i].push({"event" : "start", "timestamp" : 0});
  },
  stopRecord : function() {
    if (!this.isRecording)
      return;
    this.isRecording = false;
    var index = this.recordings.length === 0 ? this.recordings.length - 1 : 0;
    this.recordings[index].push({"event" : "end", "timestamp" : Date.now() - this.startTime});
  },
  eraseRecordings : function() {
    var recordings = this.recordings;
    this.recordings = [];
    return recordings;
  },
  getRecordings : function() {
    return this.recordings;
  },
  isRecording : false,
  // { key : ts }
  recordings : [],
  start : null,
  keysdown : {},
  // Asynchronous handlers (not part of gameplay)
  async : {},
  events : {},
  registered : [],
  handlers: {
    up : {},
    down : {},
    pressed : {}
  }
};
