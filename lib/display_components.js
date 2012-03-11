Carre.DisplayComponents = {
  
};

Carre.DisplayComponents.Player = {
  animation : {
    currentTime : 0,
    currentAnimation : null,
    spritewidth : 32,
    spriteheight : 48,
    directionCount : 2,
    directionOffset : {
      "left" : 0,
      "right" : 1
    }, // left and right.
    walking : {
      framecount : 4,
      animspeed : 750,
      index : 0
    },
    idle : {
      framecount : 1,
      animspeed : 750,
      index : 0
    }
  },
  resources : "assets/sprites/character.png",
  sprite : null,
  load : function() {
    var _this = this;
    Util.loadSprite(this.resources, function(sprite, cache) {
      if (!cache)
        Carre.notifyLoaded("player");
      _this.sprite = sprite;
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
          sy = animation.spriteheight * (animation.directionOffset[gameObject.look] + animation.currentAnimation.index * animation.directionCount);
      renderingContext.drawImage(this.sprite, sx, sy, animation.spritewidth, animation.spriteheight, gameObject.x - camera_x, gameObject.y - camera_y, animation.spritewidth, animation.spriteheight);
  }
};
