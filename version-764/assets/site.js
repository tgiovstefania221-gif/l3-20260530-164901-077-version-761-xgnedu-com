(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      var q = input.value.trim();
      if (!q) {
        event.preventDefault();
        input.focus();
      }
    });
  });

  var carousel = document.querySelector('[data-hero-carousel]');
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function applyFilter(input) {
    var root = input.closest('main') || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.movie-card'));
    var empty = root.querySelector('[data-empty-state]');
    var query = normalize(input.value);
    var visible = 0;

    cards.forEach(function (card) {
      var words = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-keywords'));
      var match = !query || words.indexOf(query) !== -1;
      card.style.display = match ? '' : 'none';
      if (match) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  document.querySelectorAll('[data-search-input]').forEach(function (input) {
    var params = new URLSearchParams(window.location.search);
    if (params.has('q') && !input.value) {
      input.value = params.get('q') || '';
    }
    input.addEventListener('input', function () {
      applyFilter(input);
    });
    if (input.value) {
      applyFilter(input);
    }
  });

  function setMessage(root, text) {
    var message = root.querySelector('[data-player-message]');
    if (!message) {
      return;
    }
    message.textContent = text || '';
    message.classList.toggle('is-visible', Boolean(text));
  }

  function initPlayer(root) {
    var video = root.querySelector('video');
    var play = root.querySelector('[data-play]');
    var src = root.getAttribute('data-src');
    var hlsInstance = null;

    if (!video || !src) {
      return;
    }

    video.controls = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          setMessage(root, '网络连接异常，正在重新加载');
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          setMessage(root, '媒体加载异常，正在恢复播放');
          hlsInstance.recoverMediaError();
        } else {
          setMessage(root, '播放暂时不可用，请稍后再试');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else {
      setMessage(root, '播放暂时不可用，请稍后再试');
    }

    function togglePlay() {
      if (video.paused) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            setMessage(root, '点击视频控件即可开始播放');
          });
        }
      } else {
        video.pause();
      }
    }

    if (play) {
      play.addEventListener('click', togglePlay);
    }

    video.addEventListener('click', togglePlay);
    video.addEventListener('play', function () {
      root.classList.add('is-playing');
      setMessage(root, '');
    });
    video.addEventListener('pause', function () {
      root.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(initPlayer);
})();
