Carre.Tile = {
  load : function(map) {
    _this = this;
    Util.log("Loading map '"+ map+"'");
    Util.xhr(map, "GET", null, function(result) {
      _this.map = JSON.parse(result);
      console.log(_this.map);
      _this.getTileset.bind(_this)(_this.map.tilesets[0].image);
    }, function() {
      console.warn("error");
    });
  },
  getTileset : function(tileset) {
    Util.log("Loading tileset '" + tileset +"'");
    _this.tiles = new Image();
    _this.tiles.onload = function() {
      _this.renderMap.bind(_this)();
    };
    _this.tiles.src = tileset;
  },
  drawTile : function(tId, dest_x, dest_y) {
  if (tId === 0) {
    return;
  }
    var tw = _this.map.tilewidth,
        th = _this.map.tileheight,
        w = _this.map.tilesets[0].imagewidth / tw,
        h = _this.map.tilesets[0].imageheight / th,
        source_x = (((tId - 1)) % w) * tw,
        source_y = Math.floor((tId - 1) / w) * tw;
    Carre.c.drawImage(_this.tiles, source_x, source_y, tw, th, dest_x, dest_y, tw, th);
  },
  renderMap : function(offset_x, offset_y) {
    var data = this.map.layers[0].data,
        tw = this.map.tilesets[0].tilewidth,
        th = this.map.tilesets[0].tileheight;
    for (var tIndex = 0; tIndex < data.length; tIndex++) {
      var dest_x = (tIndex % (this.map.width)) * tw,
          dest_y = Math.floor(tIndex / (this.map.width)) * tw;
      if (Carre.settings.layoutDebug) {
        Carre.c.fillStyle = "rgba(255, 0, 0, 0.4)";
        Carre.c.fillRect(dest_x, dest_y, 32, 32);
        Util.log("Drawing tile : " + data[tIndex]);
      }
      if (data[tIndex] !== 0) {
        this.drawTile(data[tIndex], dest_x, dest_y);
      }
    }
  },
  // The sprites in a single image.
  tiles : null,
  // The map, exported by Tiled in JSON.
  map : null
};

