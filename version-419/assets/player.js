function initializeMoviePlayer(streamUrl) {
  var video = document.getElementById("movieVideo");
  var button = document.getElementById("playStart");
  var started = false;
  var hls = null;

  if (!video || !button || !streamUrl) {
    return;
  }

  function attachStream() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function playVideo() {
    attachStream();
    button.classList.add("is-hidden");
    var promise = video.play();

    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", playVideo);
  video.addEventListener("click", function () {
    if (!started || video.paused) {
      playVideo();
    }
  });
  video.addEventListener("play", function () {
    button.classList.add("is-hidden");
  });
  video.addEventListener("ended", function () {
    button.classList.remove("is-hidden");
  });
  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
