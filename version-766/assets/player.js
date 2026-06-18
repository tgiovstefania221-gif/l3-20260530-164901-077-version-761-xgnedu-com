(function () {
  var externalHlsUrl = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
  var hlsLoader = null;

  function setMessage(container, text) {
    var message = container.querySelector('[data-player-message]');
    if (message) {
      message.textContent = text || '';
    }
  }

  function loadExternalHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoader) {
      return hlsLoader;
    }

    hlsLoader = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = externalHlsUrl;
      script.async = true;
      script.onload = function () {
        if (window.Hls) {
          resolve(window.Hls);
        } else {
          reject(new Error('HLS 初始化失败'));
        }
      };
      script.onerror = function () {
        reject(new Error('HLS 加载失败'));
      };
      document.head.appendChild(script);
    });

    return hlsLoader;
  }

  function canUseNativeHls(video) {
    return video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL');
  }

  function attachSource(container, video, source) {
    if (container.dataset.ready === 'true') {
      return Promise.resolve();
    }

    setMessage(container, '');

    if (canUseNativeHls(video)) {
      video.src = source;
      container.dataset.ready = 'true';
      return Promise.resolve();
    }

    return loadExternalHls().then(function (Hls) {
      if (!Hls || !Hls.isSupported()) {
        video.src = source;
        container.dataset.ready = 'true';
        return;
      }

      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      container.dataset.ready = 'true';
      container._hls = hls;
    });
  }

  function playVideo(container, video, source) {
    attachSource(container, video, source).then(function () {
      container.classList.add('is-playing');
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setMessage(container, '请再次点击播放按钮。');
          container.classList.remove('is-playing');
        });
      }
    }).catch(function () {
      setMessage(container, '视频加载失败，请刷新后重试。');
      container.classList.remove('is-playing');
    });
  }

  function initPlayer(container) {
    var video = container.querySelector('video');
    var button = container.querySelector('[data-play-button]');
    var source = container.getAttribute('data-video-src');

    if (!video || !source) {
      return;
    }

    if (button) {
      button.addEventListener('click', function () {
        playVideo(container, video, source);
      });
    }

    video.addEventListener('play', function () {
      container.classList.add('is-playing');
      setMessage(container, '');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        container.classList.remove('is-playing');
      }
    });

    video.addEventListener('ended', function () {
      container.classList.remove('is-playing');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-video-player]')).forEach(initPlayer);
  });
})();
