Carre.Tile = {
  load : function(map, collision) {
    var _this = this;
    Util.log("Loading map '"+ map+"'");
    Util.xhr(map, "GET", null, function(result) {
      _this.map = JSON.parse(result);
      _this.getTileset.bind(_this)(_this.map.tilesets[0].image, collision);
      _this.getBackdrop.bind(_this)(_this.map.tilesets[0].backdrop);
    }, function() {
      console.warn("error getting either the map or backdrop");
    });
  },
  getTileset : function(tileset, collision) {
    Util.log("Loading tileset '" + tileset +"'");
    this.tiles = new Image();
    this.tiles.onload = function() {
      console.log("Loaded");
      Carre.notifyLoaded.bind(Carre)("tileset");
    };
    this.tiles.src = tileset;
    var _this = this;
    Util.log("Loading collision map '" + collision + "'");
    Util.xhr(collision, "GET", null, function(result) {
      _this.collision = JSON.parse(result);
      Carre.notifyLoaded.bind(Carre)("collision");
    }, function() {
      console.warn("error loading collision map.");
    });
  },
  getBackdrop : function(backdrop) {
    Util.log("Loading backdrop '" + backdrop + "'");
    var _this = this;
    Util.loadImageAsset(backdrop, function(backdrop, cacheHit) {
      _this.backdrop = backdrop;
      Carre.notifyLoaded.bind(Carre)("backdrop");
    });
  },
  // Draw the backdrop from the x and y coordinates
  drawBackdrop : function(x, y) {
    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    Carre.c.drawImage(this.backdrop, x/2, y/2, Carre.settings.width, Carre.settings.height, 0, 0, Carre.settings.width, Carre.settings.height);
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
    var tw = this.map.tilewidth,
        th = this.map.tileheight,
        w = this.map.tilesets[0].imagewidth / tw,
        h = this.map.tilesets[0].imageheight / th,
        source_x = (((tId - 1)) % w) * tw,
        source_y = Math.floor((tId - 1) / w) * tw;
      Carre.c.drawImage(this.tiles, source_x, source_y, tw, th, dest_x, dest_y, tw, th);
  },
  // offset_x and offset_y defines the top left corner of the viewport.
  renderMap : function(offset_x, offset_y) {
    var data = this.map.layers[0].data,
        tw = this.map.tilesets[0].tilewidth,
        th = this.map.tilesets[0].tileheight,
        mw = this.map.width,
        mh = this.map.height;
    this.drawBackdrop(offset_x + this.backdropOffsetX, offset_y + this.backdropOffsetY);
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
            if (data[tile_index] !== 0 && this.isInMap(x, y, mw, mh))  {
              this.drawTile(data[tile_index], dest_x, dest_y);
            }
            if (Carre.settings.collisionDebug) {
              Carre.c.fillStyle = "rgba(0, 0, 255, 0.4)";
              if (this.collision[data[tile_index]] != "noclip") {
                Carre.c.fillRect(dest_x, dest_y, tw, th);
              }
            }
          }
        }
  },
  // The sprites in a single image.
  tiles : null,
  // The backdrop, a single image.
  backdrop : null,
  backdropOffsetX : 400,
  backdropOffsetY : 400,
  // The map, exported by Tiled in JSON.
  map : null,
  collision : null
};

