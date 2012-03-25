Carre.DisplayComponents = {

};

Carre.DisplayComponents.Player = {
  animation : {
    currentTime : 0,
    currentAnimation : null,
    spritewidth : 90,
    spriteheight : 90,
    directionCount : 2,
    directionOffset : {
      "left" : 1,
      "right" : 0
    }, // left and right.
    walking : {
      framecount : 2,
      animspeed : 333,
      index : 1
    },
    idle : {
      framecount : 2,
      animspeed : 1500,
      index : 0
    },
    jump_up : {
      framecount : 1,
      animspeed : 1000,
      index : 2
    },
    jump_down : {
      framecount : 1,
      animspeed : 1000,
      index : 3
    }
  },
  resources : "assets/sprites/hero.png",
  sprite : null,
  load : function() {
    var _this = this;
    Util.loadImageAsset(this.resources, function(sprite, cache) {
      if (!cache)
        Carre.notifyLoaded("player");
      _this.sprite = sprite;
      _this.imageHeight = sprite.height / Carre.Tile.tilesetsColorNumber;
    });
    this.animation.currentAnimation = this.animation.idle;
  },
  display : function(gameObject, renderingContext, elapsedTime) {
    var camera_x = Carre.GameLogic.objectByFamily.camera[0].x,
        camera_y = Carre.GameLogic.objectByFamily.camera[0].y,
        animation = this.animation,
        currentFrame;

    animation.currentTime = (animation.currentTime + elapsedTime / animation.currentAnimation.animspeed) % 1;
    currentFrame = Math.floor(animation.currentTime * animation.currentAnimation.framecount);
    var sx = currentFrame * animation.spritewidth,
        sy = animation.spriteheight * (animation.directionOffset[gameObject.look] + animation.currentAnimation.index * animation.directionCount) + (gameObject.color * this.imageHeight);
    renderingContext.drawImage(this.sprite, sx, sy, animation.spritewidth, animation.spriteheight, gameObject.x - camera_x, gameObject.y - camera_y, animation.spritewidth, animation.spriteheight);
  }
};

Carre.DisplayComponents.Particle = {
  animation: {
    spritewidth : 42,
    spriteheight : 42,
    directionOffset : {
      "left" : 1,
      "right" : 0
    }
  },
  resources : "assets/sprites/particles_cube.png",
  sprite : null,
  load: function() {
    var _this = this;
    Util.loadImageAsset(this.resources, function(sprite, cache) {
      if (!cache)
        Carre.notifyLoaded("particle");
      _this.sprite = sprite;
    });
  },
  display: function(gameObject, renderingContext, elapsedTime) {
    var camera_x = Carre.GameLogic.objectByFamily.camera[0].x,
        camera_y = Carre.GameLogic.objectByFamily.camera[0].y,
        animation = this.animation,
        sx = animation.spritewidth * animation.directionOffset[gameObject.look],
        sy = animation.spriteheight * ( ( ( gameObject.color || 0 ) + 2 ) % 3 );

    renderingContext.globalAlpha = gameObject.opacity;
    renderingContext.drawImage(this.sprite, sx, sy, animation.spritewidth, animation.spriteheight, Math.round(gameObject.x - camera_x - gameObject.width /2), Math.round(gameObject.y - camera_y - gameObject.height /2), Math.round(gameObject.width), Math.round(gameObject.height));
    renderingContext.globalAlpha = 1;
  }
}


Carre.DisplayComponents.BumperUp = {
  resources : "assets/sprites/bumper_up.png",
  sprite : null,
  load: function() {
    var _this = this;
    Util.loadImageAsset(this.resources, function(sprite, cache) {
      if (!cache)
        Carre.notifyLoaded("bumper_up");
      _this.sprite = sprite;
    });
  },
  display: function(gameObject, renderingContext, elapsedTime) {
    var camera_x = Carre.GameLogic.objectByFamily.camera[0].x,
        camera_y = Carre.GameLogic.objectByFamily.camera[0].y;
    renderingContext.drawImage( 
            this.sprite
            , Math.round(gameObject.x - camera_x)
            , Math.round(gameObject.y - camera_y)
            , Math.round(this.sprite.width)
            , Math.round(this.sprite.height)
    );
  }
}
