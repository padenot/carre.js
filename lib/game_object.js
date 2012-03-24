function GameObject(desc) {
  this.x = desc.x || 0;
  this.y = desc.y || 0;
  this.vx = desc.vx || 0;
  this.vy = desc.vy || 0;
  this.width = desc.width;
  this.height = desc.height;
  this.opacity = desc.opacity || 1;
  this.look = desc.look || "right";
  this.displayComponent = desc.displayComponent || null;
  this.families = desc.families || [];
  if (this.displayComponent && !desc.noload) {
    this.displayComponent.load();
  }
  this.collisionPoints = desc.collisionPoints || {};
  this.friction  = desc.friction || 1;
  this.maxspeed = desc.maxspeed || 5;
  this.destroyCallback = desc.destroyCallback;
}

GameObject.prototype.destroy = function() {
  var index = Carre.GameLogic.objects.indexOf(this);
  if (this.destroyCallback) {
    this.destroyCallback();
  }
  var _this = this,
      o = Carre.GameLogic.objects.splice(index, 1);
  this.families.forEach(function (e) {
    var i = Carre.GameLogic.objectByFamily[e].indexOf(_this);
    Carre.GameLogic.objectByFamily[e].splice(i, 1);
  });
};
