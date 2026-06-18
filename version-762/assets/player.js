(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function attachSource(video, source) {
    if (video.dataset.ready === "1") {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.dataset.ready = "1";
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      video.dataset.ready = "1";
      return;
    }
    video.src = source;
    video.dataset.ready = "1";
  }

  function setupPlayer(player) {
    var video = player.querySelector(".player-video");
    var cover = player.querySelector(".player-cover");
    var source = player.getAttribute("data-stream");
    if (!video || !cover || !source) {
      return;
    }

    function play() {
      attachSource(video, source);
      video.controls = true;
      player.classList.add("is-playing");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          player.classList.remove("is-playing");
        });
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".hls-player")).forEach(setupPlayer);
  });
})();
