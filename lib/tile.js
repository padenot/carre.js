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
      console.log("Loaded");
      Carre.notifyLoaded.bind(Carre)("tileset");
    };
    _this.tiles.src = tileset;
  },
  isInMap : function(t_x, t_y, mw, mh) {
    var cond = (t_x < mw && t_y < mh &&
                t_x >= 0 && t_y >= 0);

    return cond;
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
  // offset_x and offset_y defines the top left corner of the viewport.
  renderMap : function(offset_x, offset_y) {
    var data = this.map.layers[0].data,
        tw = this.map.tilesets[0].tilewidth,
        th = this.map.tilesets[0].tileheight,
        mw = this.map.width,
        mh = this.map.height;
    // compute the index of the first tile to draw.
    var tile_offset_x = Math.floor(offset_x / tw),
        tile_offset_y = Math.floor(offset_y / th),
        // Viewport size, in tile unit
        vp_t_x = Math.ceil((offset_x + Carre.settings.width) / tw) - tile_offset_x,
        vp_t_y = Math.ceil((offset_y + Carre.settings.width) / th) - tile_offset_y,
        // Index
        x, y;
        for (y = tile_offset_y; y < tile_offset_y + vp_t_y; y++) {
          for (x = tile_offset_x; x < tile_offset_x + vp_t_x; x++) {
            var dest_x = x * tw - offset_x,
                dest_y = y * th - offset_y,
                tile_index = x + y * Math.floor(mw);

            if (Carre.settings.layoutDebug) {
              Carre.c.fillStyle = "rgba(255, 0, 0, 0.4)";
              Carre.c.fillRect(dest_x, dest_y, tw, th);
              Util.log("Drawing tile : " + data[tile_index]);
            }
            if (data[tile_index] !== 0 && _this.isInMap(x, y, mw, mh))  {
              this.drawTile(data[tile_index], dest_x, dest_y);
            }
          }
        }
  },
  // The sprites in a single image.
  tiles : null,
  // The map, exported by Tiled in JSON.
  map : null
};

