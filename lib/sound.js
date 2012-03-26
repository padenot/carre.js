Carre.Sound = {
  init : function() {
    var assetCount = Carre.settings.sounds.length,
        extension = "." + this.getMediaType(),
        _this = this,
        downloaded = 0;
    Carre.settings.sounds.forEach(function(e) {
      var s = new Audio(_this.prefix + e + extension);
      if (Carre.settings.loop.indexOf(e) != -1) {
        s.loop = true;
      }
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
    var a = new Audio();
    if (a.canPlayType("video/ogg; codec=vorbis")) {
      return "ogg";
    }
    if (a.canPlayType("audio/mp3")) {
      return "mp3";
    }
    return "";
  },
  trigger : function(name) {
    if (!this.muted) {
      // We want to clone the node to be able to play the 
      // sound multiple time at once.
      var _this = this,
          n = this.sound[name];
      if (n !== undefined) {
        n = n.cloneNode(false);
      } else {
        console.log("can't trigger " + name);
        return;
      }
      this.playing.push(n);
      n.play();
      n.addEventListener('ended', function() {
        _this.playing.splice(_this.playing.indexOf(n), 1);
      });
    }
  },
  muteUnmute : function() {
    var _this = this;
    this.muted = !this.muted;
    this.playing.forEach(function(e) {
      e.muted = _this.muted;
    });
  },
  fadeToSilence : function() {
    var soundsPlaying = this.playing.slice(0);
    (function fadeClosure() {
          for (var i in soundsPlaying) {
            soundsPlaying[i].volume *= 0.95;
            if (soundsPlaying[i].volume > 0.01) {
              setTimeout(fadeClosure, 200);
            } else {
              //soundsPlaying[i].pause();
              soundsPlaying.slice(i, 1);
            }
          }
    })();
  },
  sound : {},
  playing : [],
  downloaded : 0,
  prefix : "assets/sounds/"
};
