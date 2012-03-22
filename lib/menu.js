Carre.Menu = {

  init : function() {
    var m = document.getElementById("menu");
    m.style.width = Carre.settings.width + "px";
    m.style.height = Carre.settings.height + "px";
    var c = document.getElementsByTagName('canvas')[0];
    m.style.top = c.offsetTop + "px";
    m.style.left = c.offsetLeft + "px";
  },
  show : function() {
    document.getElementById("menu").style.visibility = "visible";
  },
  hide : function() {
    document.getElementById("menu").style.visibility = "hidden";
  },
  showHideControls : function() {
    var v = document.querySelector('.controls').style.visibility;
    if (v === "visible") {
      document.querySelector('.controls').style.visibility = "hidden";
    } else {
      document.querySelector('.controls').style.visibility = "visible";
    }
  },
  notifyLoadingFinished : function() {
    document.getElementById('play').disabled = false;
  },
  showHidePauseLabel : function() {
    var e = document.querySelector('.pauseLabel');
    if (e !== null) {
      e.parentElement.removeChild(e);
    } else {
      var p = document.createElement('div');
      p.className = "pauseLabel";
      p.innerHTML = "Game paused !";
      document.querySelector('body').appendChild(p);
    }
  }
};
