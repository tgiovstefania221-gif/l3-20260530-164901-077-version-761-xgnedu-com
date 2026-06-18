import { H as Hls } from './hls.js';

const players = new WeakMap();

function showMessage(container, text) {
  const message = container.querySelector('.js-player-message');
  if (message) {
    message.textContent = text;
    message.classList.add('is-visible');
  }
}

function hideMessage(container) {
  const message = container.querySelector('.js-player-message');
  if (message) {
    message.textContent = '';
    message.classList.remove('is-visible');
  }
}

function playVideo(container) {
  const video = container.querySelector('video');
  const source = container.getAttribute('data-src');
  if (!video || !source) {
    return;
  }

  hideMessage(container);

  if (players.has(video)) {
    video.play()
      .then(function () {
        container.classList.add('is-playing');
      })
      .catch(function () {
        showMessage(container, '视频暂时无法自动播放，请再次点击播放按钮。');
      });
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    players.set(video, { native: true });
    video.addEventListener('loadedmetadata', function () {
      video.play()
        .then(function () {
          container.classList.add('is-playing');
        })
        .catch(function () {
          showMessage(container, '视频暂时无法自动播放，请再次点击播放按钮。');
        });
    }, { once: true });
    video.addEventListener('error', function () {
      showMessage(container, '视频加载失败，请稍后重试。');
    });
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    players.set(video, hls);
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play()
        .then(function () {
          container.classList.add('is-playing');
        })
        .catch(function () {
          showMessage(container, '视频暂时无法自动播放，请再次点击播放按钮。');
        });
    });
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        showMessage(container, '视频加载失败，请稍后重试。');
      }
    });
    return;
  }

  showMessage(container, '当前浏览器不支持此视频播放格式。');
}

function pauseVideo(container) {
  const video = container.querySelector('video');
  if (video && !video.paused) {
    video.pause();
    container.classList.remove('is-playing');
  }
}

function initPlayer(container) {
  const video = container.querySelector('video');
  const buttons = Array.prototype.slice.call(container.querySelectorAll('.js-play'));

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      playVideo(container);
    });
  });

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo(container);
      } else {
        pauseVideo(container);
      }
    });
    video.addEventListener('play', function () {
      container.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      container.classList.remove('is-playing');
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  Array.prototype.slice.call(document.querySelectorAll('.js-player')).forEach(initPlayer);
});
