function GameObject(desc) {
  this.x = desc.x || 0;
  this.y = desc.y || 0;
  this.vx = desc.vx || 0;
  this.vy = desc.vy || 0;
  this.look = desc.look || "right";
  this.displayComponent = desc.displayComponent || null;
  this.families = desc.families || [];
  if (this.displayComponent) {
    this.displayComponent.load();
  }
}

