/**
 *  url : the url to request
 *  method : the method to use
 *  data : the data to send (string)
 *  onsuccess : called in case of success (arg: the data received).
 *  onerror : called in case of error (e.target.status for the error)
 *  onprogress : get the progress (e.position, e.totalSize are available)
 *  onload : called when the transfer is complete
 *  onabort : called when the transfer has been canceled.
 */
Util.xhr = function XHR(url, method, data, onsuccess, onfailure, onprogress, onload, onabort) {
  var request = new XMLHttpRequest();
  // Ten seconds is ought to be enough for anybody.
  var xhrtimeout = setTimeout(onfailure, 10000);
  request.addEventListener("progress", onprogress, false);
  request.addEventListener("load", onprogress, false);
  request.addEventListener("error", onfailure, false);
  request.addEventListener("abort", onabort, false);
  request.addEventListener("readystatechange", function (e) {
    if (request.readyState == 4) {
      if (request.status == 200) {
        clearTimeout(xhrtimeout);
        onsuccess(request.responseText);
      } else {
        onfailure(e);
      }
    }
  });

  request.open(method, url, true);
  request.send(data);
};

Util.loadImageAsset = function(url, callback) {
    Util.log("Loading image '" + url +"'");
    if (Util.assets[url] !== undefined) {
      callback(Util.assets[url], true);
      return;
    }
    var sprite = new Image();
    sprite.onload = function() {
      console.log("Loaded '" + url +"'");
      Util.assets[url] = sprite;
      callback(sprite, false);
    };
    sprite.src = url;
};

Util.assets = {};

Util.c = function(e,v,n,c,r){r=e[c='className'].replace(eval('/ *\\b'+n+'\\b/g'),'');return'has'==v?r!=e[c]:e[c]={add:1,toggle:r==e[c]}[v]?r+' '+n:r};

Util.extend = function extend(c){for(var e=arguments.length,d=0,a,b;d++<e;)if(a=arguments[d],null!=a&&a!=c)for(b in a)void 0!==a[b]&&(c[b]=a[b]);return c};

Util.addParticle = function( GameLogic, p ) {
  var head = p.collisionPoints.head1,
      collided = p.collided;

  GameLogic.create("particle", {
    x: p.x + head.x + Math.round(Math.random() * 16 * Util.randomDirection()),
    y: p.y + head.y - 1,
    vy: (collided === "head" ? 1 : -1) * (.2 + Math.random() * .6),
    vx: collided === "left" ? 1  + Math.random() * .5 :
      collided === "right" ? -(1  + Math.random() * .5) :
      Util.randomDirection() * ( collided ? 2 : .2 ),
    width: 24,
    height: 24,
    color: p.color,
    look: p.look,
    noload: true
  });
};

Util.modulo = function(a, n) {
  a = parseInt(a);
  n = parseInt(n);
  return ((a % n) + n) % n;
};

Util.randomDirection = function() {
  return Math.round(Math.random()) ? 1 : -1;
};
