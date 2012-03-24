Carre.DisplayComponents = {

};

Carre.DisplayComponents.Player = {
  animation : {
    currentTime : 0,
    currentAnimation : null,
    spritewidth : 83,
    spriteheight : 67,
    directionCount : 2,
    directionOffset : {
      "left" : 0,
      "right" : 1
    }, // left and right.
    walking : {
      framecount : 4,
      animspeed : 333,
      index : 0
    },
    idle : {
      framecount : 1,
      animspeed : 750,
      index : 0
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
      _this.imageHeight = sprite.height / Carre.Tile.colorNumber;
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
