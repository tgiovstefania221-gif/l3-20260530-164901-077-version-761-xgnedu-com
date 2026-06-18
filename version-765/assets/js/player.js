import { H as Hls } from './video-player-dru42stk.js';

function setupPlayers() {
  document.querySelectorAll('[data-player-shell]').forEach(function (shell) {
    var video = shell.querySelector('video[data-src]');
    var button = shell.querySelector('[data-play-button]');
    var status = shell.querySelector('[data-video-status]');
    var source = video ? video.dataset.src : '';
    var hlsInstance = null;
    var initialized = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function initialize() {
      if (!video || !source || initialized) {
        return;
      }
      initialized = true;
      setStatus('正在载入播放源');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('已使用浏览器原生 HLS 播放');
      } else if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源加载完成');
        });
        hlsInstance.on(Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，已尝试恢复');
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            }
          }
        });
      } else {
        video.src = source;
        setStatus('当前浏览器可能不支持 HLS');
      }
    }

    function play() {
      initialize();
      if (button) {
        button.classList.add('hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('请再次点击播放器开始播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('hidden');
        }
      });
      video.addEventListener('pause', function () {
        setStatus('已暂停');
      });
      video.addEventListener('ended', function () {
        setStatus('播放结束');
      });
      video.addEventListener('error', function () {
        setStatus('播放源暂时无法访问');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupPlayers);
} else {
  setupPlayers();
}
