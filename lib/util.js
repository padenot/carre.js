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
