function initMoviePlayer(src) {
  var video = document.getElementById("movieVideo");
  var overlay = document.getElementById("playerOverlay");
  var instance = null;
  var ready = false;

  if (!video || !overlay || !src) {
    return;
  }

  function attach() {
    if (ready) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      instance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      instance.loadSource(src);
      instance.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      video.src = src;
    }

    ready = true;
  }

  function start() {
    attach();
    overlay.classList.add("is-hidden");
    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        overlay.classList.remove("is-hidden");
      });
    }
  }

  overlay.addEventListener("click", start);

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });

  video.addEventListener("play", function () {
    overlay.classList.add("is-hidden");
  });

  video.addEventListener("ended", function () {
    overlay.classList.remove("is-hidden");
  });

  window.addEventListener("pagehide", function () {
    if (instance && typeof instance.destroy === "function") {
      instance.destroy();
    }
  });
}
