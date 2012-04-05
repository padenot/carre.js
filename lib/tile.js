/**
 * Tile engine, load and display tiles for a map.
 */
Carre.Tile = {

  /**
   * Load a new tileset from a map and a collision matrix.
   *
   * @param map URL of the JSON file containing the map.
   * @return void
   */
  load : function(map) {
    var _this = this;
    Util.log("Loading map '"+ map+"'");
    Util.xhr(map, "GET", null, function(result) {
      _this.map = JSON.parse(result);
      _this.getTileset.bind(_this)(_this.map.tilesets[0].image);
      _this.getBackdrop.bind(_this)(Carre.settings.vignette, Carre.settings.backdrop, Carre.settings.backdroplq, Carre.settings.backdrop_logo);
      _this.getLayers.bind(_this)(_this.map.layers);
      _this.generateColorIndexes(_this.map.properties.colorNumber, _this.map.properties.tilesetsColorNumber);
      _this.levelBottom = _this.map.height * _this.map.tilewidth + 200;
    }, function() {
      console.warn("error getting either the map or backdrop");
    });
  },

  /**
   * Load images and collision matrix for a tileset.
   *
   * @param tileset URL of the image containing all the sprites for this map.
   * @return void
   */
  getTileset : function(tileset) {
    Util.log("Loading tileset '" + tileset +"'");
    this.tiles = new Image();
    this.tiles.onload = function() {
      console.log("Loaded");
      Carre.notifyLoaded.bind(Carre)("tileset");
    };
    this.tiles.src = tileset;
  },

  /**
   * Load the background image of the map.
   *
   * @param vignette URL a crop mask for the background
   * @param backdrop array of URLs of images containing the background in paint
   * order.
   * @return void
   */
  getBackdrop : function(vignette, backdrop, backdroplq, cpu) {
    var _this = this;
    backdrop.forEach(function(url) {
      Util.log("Loading backdrop '" + url + "'");
      Util.loadImageAsset(url, function(image, cacheHit) {
        _this.backdrop.push(image);
        _this.backdrop_download++;
        if (_this.backdrop_download === backdrop.length - 1) {
          Carre.notifyLoaded.bind(Carre)("backdrop");
        }
      });
    });
    Util.loadImageAsset(backdroplq, function(bdlq, cacheHit) {
      _this.backdroplq = bdlq;
      Carre.notifyLoaded.bind(Carre)("bdlq");
    });
    Util.loadImageAsset(vignette, function(v, cacheHit) {
      _this.vignette = v;
      Carre.notifyLoaded.bind(Carre)("vignette");
    });
    Util.loadImageAsset(vignette, function(v, cacheHit) {
      _this.vignette = v;
      Carre.notifyLoaded.bind(Carre)("vignette");
    });
    Util.loadImageAsset(cpu, function(cpu, cacheHit) {
      _this.cpu = cpu;
      Carre.notifyLoaded.bind(Carre)("cpu");
    });
  },

  /**
   * Load the background image of the map.
   *
   * @param backdrop URL of the image containing the background.
   * @return void
   */
  getLayers : function(layers) {
    this.layers = {
      "decor": []
    };

    for (var i in layers) {
      var layer = layers[i];
      if (layer.name == "solid") {
        this.layers.solid = layer;
      }
      else if (layer.name == "player") {
        var player = Carre.GameLogic.objectByFamily["player"][0];
        player.x = Carre.GameLogic.gameObjects.player.x = layer.objects[0].x;
        player.y = Carre.GameLogic.gameObjects.player.y = layer.objects[0].y;
        player.color = Carre.GameLogic.gameObjects.player.color = parseInt(layer.objects[0].properties.color);
      }
      else if (layer.name == "end") {
        for (var o in layer.objects) {
          var obj = layer.objects[o]
            , ender = Carre.GameLogic.create("level_end", Carre.GameLogic.gameObjects.level_end);
          ender.x = obj.x;
          ender.y = obj.y;
          ender.boundingBox = obj;
        }
      }
      else if (layer.name == "bumpers") {
        for (var o in layer.objects) {
          var obj = layer.objects[o]
            , type = obj.type || "up"
            , bumper_type = "bumper_" + type
            , bumper = Carre.GameLogic.create(bumper_type, Carre.GameLogic.gameObjects[bumper_type]);
          bumper.x = obj.x;
          bumper.y = obj.y;
          bumper.boundingBox = obj;
        }
      }
      else if (layer.type == "tilelayer") {
        this.layers.decor.push(layer);
      }
    }
  },

  /**
   * Get the number of color and compute the current color of each tile.
   *
   * @param colorNumber Number of colors the level uses.
   * @param tilesetsColorNumber Number of colors the tilesets have.
   * @return void
   */
  generateColorIndexes : function(colorNumber, tilesetsColorNumber) {
    if (typeof colorNumber !== "undefined" && colorNumber !== null) {
      this.colorNumber = parseInt(colorNumber);
    } else {
      this.colorNumber = 1;
    }
    if (typeof tilesetsColorNumber !== "undefined" && tilesetsColorNumber !== null) {
      this.tilesetsColorNumber = parseInt(tilesetsColorNumber);
    } else {
      this.tilesetsColorNumber = 1;
    }

    Carre.colorConv = [];
    for (var i = 0; i < this.colorNumber; i++) {
      Carre.colorConv[i] = i;
    }

    this.mapHeight = this.map.tilesets[0].imageheight / this.tilesetsColorNumber;

    this.mapData = [];
    for (var l in this.map.layers) {
      if (this.map.layers[l].type !== "tilelayer") {
        continue;
      }
      var data = this.map.layers[l].data;

      this.mapData[l] = [];

      if (this.map.layers[l].name === "solid") {
        this.solidMapData = this.mapData[l];
      }

      for (var i in data) {
        var tId = data[i];

        if (tId === 0) {
          var source_x = 0,
              source_y = 0,
              color = 0;
        } else {
          var tw = this.map.tilewidth,
              th = this.map.tileheight,
              w = this.map.tilesets[0].imagewidth / tw,
              source_x = ((tId - 1) % w) * tw,
              source_y = Math.floor((tId - 1) / w) * tw,
              color = Math.floor(source_y / this.mapHeight);

          source_y = source_y - color * this.mapHeight;
        }

        this.mapData[l][i] = {
          "x": source_x,
          "y": source_y,
          "color": color,
        }
      }
    }
  },

  /**
   * Draw the background image from its x and y coordinates.
   *
   * @param x Offset on x-axis of the image.
   * @param y Offset on y-axis of the image.
   * @return void
   */
  drawBackdrop : function(x, y) {
    /*
    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    */
    if (Carre.settings.quality === "HQ") {
      for (var i = 0; i < this.backdrop.length; i++) {
        Carre.c.drawImage(this.backdrop[i], Carre.settings.width/2-x/(i+2), -y/(i+2), Carre.settings.width, Carre.settings.height);
      }
      Carre.c.drawImage(this.cpu, Carre.settings.width/2-x/5, Carre.settings.Height/2-y/5, Carre.settings.width, Carre.settings.height);
      Carre.c.drawImage(this.vignette, 0, 0, Carre.settings.width, Carre.settings.height);
    } else {
      //Carre.c.drawImage(this.backdroplq, x/2, y/2, Carre.settings.width, Carre.settings.height, 0, 0, Carre.settings.width, Carre.settings.height);
      Carre.c.fillRect(0,0,800,600);
      Carre.c.drawImage(this.backdroplq, Carre.settings.width/2-x/5, -y/5, Carre.settings.width, Carre.settings.height);
    }
  },


  /**
   * Return a boolean indicating whether a point is in a square.
   *
   * @param t_x X coordinate of the point.
   * @param t_y Y coordinate of the point.
   * @param mw Width of the map.
   * @param mh Height of the map.
   */
  isInMap : function(t_x, t_y, mw, mh) {
    var cond = (t_x < mw && t_y < mh &&
                t_x >= 0 && t_y >= 0);

    return cond;
  },

  /**
   * Draw a tile.
   *
   * @param id Identifier of the tile to draw.
   * @param dest_x X destination on the viewport of the tile.
   * @param dest_y Y destination on the viewport of the tile.
   * @return void
   */
  drawTile : function(tileData, tId, dest_x, dest_y) {
    if (tId === 0) {
      return;
    }
    var tw = this.map.tilewidth,
        th = this.map.tileheight,
        source_y = tileData.y + Carre.colorConv[tileData.color] * this.mapHeight;
    Carre.c.drawImage(this.tiles, tileData.x, source_y, tw, th, dest_x, dest_y, tw, th);
  },

  /**
   * Draw the entire map.
   *
   * offset_x and offset_y define the top left corner of the viewport.
   */
  renderMap : function(offset_x, offset_y) {
    this.drawBackdrop(offset_x, offset_y);
    for (var l in this.map.layers) {
      if (this.map.layers[l].type !== "tilelayer") {
        continue;
      }
      var data = this.map.layers[l].data,
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
          if (data[tile_index] !== 0 && this.isInMap(x, y, mw, mh))  {
            this.drawTile(this.mapData[l][tile_index], data[tile_index], dest_x, dest_y);
          }
          if (Carre.settings.collisionDebug) {
            Carre.c.fillStyle = "rgba(0, 0, 255, 0.4)";
            if (this.collision[data[tile_index]] != "noclip") {
              Carre.c.fillRect(dest_x, dest_y, tw, th);
            }
          }
        }
      }
    }
  },

  // The sprites in a single image.
  tiles : null,
  // The backdrop, an array of images in paint order
  backdrop : [],
  // The backdrop in low quality (no parallax).
  backdroplq : null,
  cpu : null,
  backdropOffsetX : 400,
  backdropOffsetY : 400,
  // The map, exported by Tiled in JSON.
  map : null,
  collision : null,
  vignette : null,
  // Count the number of assets downloaded so far.
  backdrop_download : 0
};

