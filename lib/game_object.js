function GameObject(desc) {
  // TODO make this better because it sucks.
  //~ for (attr in desc) {
    //~ if (desc.hasOwnProperty(attr)) {
      //~ this[attr] = desc[attr];
    //~ }
  //~ }
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
  this.collisionPoints = desc.collisionPoints || {};
  this.friction  = desc.friction || 1;
  this.maxspeed = desc.maxspeed || 5;
  this.onBeforeDestroy = desc.onBeforeDestroy;
  this.onAfterDestroy = desc.onAfterDestroy;
  this.color = desc.color || 0;
  this.destroyCallback = desc.destroyCallback;
  this.color = desc.color;
  this.boundingBox = desc.boundingBox || {x:0,y:0,width:32,height:32};
  this.type = desc.type || null;
  if (this.displayComponent && !desc.noload) {
    this.displayComponent.load();
  }
}

GameObject.prototype.destroy = function() {
  if (this.onBeforeDestroy) {
    this.onBeforeDestroy(this);
  }

  var index = Carre.GameLogic.objects.indexOf(this);
  var _this = this,
      o = Carre.GameLogic.objects.splice(index, 1);
  this.families.forEach(function (e) {
    var i = Carre.GameLogic.objectByFamily[e].indexOf(_this);
    Carre.GameLogic.objectByFamily[e].splice(i, 1);
  });

  if (this.onAfterDestroy) {
    this.onAfterDestroy(this);
  }
};
