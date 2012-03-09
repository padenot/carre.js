Carre.Inputs = {
  dispatch : function(key, event) {
    if (event === "down") {
      this.keysdown[key] = true;
    } else {
      delete this.keysdown[key];
    }

    if (this.handlers[key]) {
      //for (var i = 0; i < this.handlers[key].length; i++) {
        //this.handlers[event][key][i]();
        this.handlers[event][key]();
      //}
    }
  },
  isKeyDown : function(key) {
    return this.keysdown[key] === true ? true : false;
  },
  register : function(key, event, callback) {
    //if (this.handlers[event][key] === undefined) {
      //this.handlers[event][key] = [];
    //}
    this.handlers[event][key] = callback;
    console.log(callback);
  },
  process : function() {
    for (var i in this.keysdown) {
      if (this.handlers.pressed[i]) {
        //for (var j = 0; j < this.handlers.pressed[key].length; j++) {
          this.handlers.pressed[i]();
          //this.handlers.pressed[key][j]();
        //}
      }
    }
  },
  keysdown : {},
  handlers: {
    up : {},
    down : {},
    pressed : {}
  }
};
