Carre.DisplayComponents = {
  
};

Carre.DisplayComponents.Player = {
  resources : "assets/sprites/character.png",
  sprite : null,
  load : function() {
    var _this = this;
    Util.loadSprite(this.resources, function(sprite) {
      Carre.notifyLoaded("player");
      _this.sprite = sprite;
    });
  },
  display : function(gameObject, renderingContext) {
    if (gameObject.vx === 0 && gameObject.vy === 0) {
      var camera_x = Carre.GameLogic.objectByFamily.camera[0].x,
          camera_y = Carre.GameLogic.objectByFamily.camera[0].y;
      if (gameObject.look == "right") {
        renderingContext.drawImage(this.sprite, 0, 48, 24, 48, gameObject.x - camera_x, gameObject.y - camera_y, 24, 48);
      } else {
        renderingContext.drawImage(this.sprite, 0, 0, 24, 48, gameObject.x - camera_x, gameObject.y - camera_y, 24, 48);
      }
    }
  }
};
