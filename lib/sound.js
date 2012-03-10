Carre.Sound = {
  init : function() {
    var assetCount = Carre.settings.sounds.length,
        extension = "." + this.getMediaType(),
        _this = this,
        downloaded = 0;
    Carre.settings.sounds.forEach(function(e) {
      var s = new Audio(_this.prefix + e + extension);
      s.addEventListener("loadeddata", function() {
        downloaded += 1;
        if (downloaded == Carre.settings.sounds.length) {
          Carre.notifyLoaded("sounds");
        }
      });
      s.preload = "auto";
      s.load();
      _this.sound[e] = s;
    });
  },
  getMediaType : function() {
    if (Audio().canPlayType("video/ogg; codec=vorbis")) {
      return "ogg";
    }
    if (Audio().canPlayType("audio/mp3")) {
      return "mp3";
    }
    return "";
  },
  trigger : function(name) {
    if (!this.muted) {
      this.sound[name].play();
    }
  },
  muteUnmute : function() {
    this.muted = !this.muted;
    for (var s in this.sound) {
      this.sound[s].muted = this.muted;
    }
  },
  sound : {},
  downloaded : 0,
  prefix : "assets/sounds/"
};
