(function () {
  var qs = function (selector, root) {
    return (root || document).querySelector(selector);
  };

  var qsa = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  var mobileButton = qs('[data-mobile-toggle]');
  var mobileMenu = qs('[data-mobile-menu]');

  if (mobileButton && mobileMenu) {
    mobileButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  qsa('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = qs('input', form);
      var value = input ? input.value.trim() : '';
      var target = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
      window.location.href = target;
    });
  });

  qsa('[data-hero-slider]').forEach(function (slider) {
    var slides = qsa('.hero-slide', slider);
    var dots = qsa('.hero-dot', slider);
    var prev = qs('[data-hero-prev]', slider);
    var next = qs('[data-hero-next]', slider);
    var index = 0;
    var timer = null;

    var show = function (nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };

    var play = function () {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    };

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    show(0);
    play();
  });

  var searchPageInput = qs('[data-search-input]');
  var searchCards = qsa('[data-search-card]');

  if (searchPageInput && searchCards.length) {
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    searchPageInput.value = initial;

    var applySearch = function () {
      var value = searchPageInput.value.trim().toLowerCase();
      searchCards.forEach(function (card) {
        var haystack = (card.getAttribute('data-search') || '').toLowerCase();
        var visible = !value || haystack.indexOf(value) !== -1;
        card.classList.toggle('hidden-by-search', !visible);
      });
    };

    searchPageInput.addEventListener('input', applySearch);
    applySearch();
  }

  qsa('[data-player]').forEach(function (player) {
    var video = qs('video', player);
    var overlay = qs('.player-overlay', player);
    var src = player.getAttribute('data-src');
    var loaded = false;
    var hls = null;

    if (!video || !src) {
      return;
    }

    var load = function () {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    };

    var start = function () {
      load();
      player.classList.add('is-playing');
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          player.classList.remove('is-playing');
        });
      }
    };

    if (overlay) {
      overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        player.classList.remove('is-playing');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  });
})();

(function () {
  var sliders = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slider]'));
  sliders.forEach(function (slider) {
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var copies = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-copy]'));
    if (!dots.length || !copies.length) {
      return;
    }
    var sync = function () {
      var active = dots.findIndex(function (dot) {
        return dot.classList.contains('is-active');
      });
      copies.forEach(function (copy, index) {
        copy.style.display = index === active ? '' : 'none';
      });
    };
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setTimeout(sync, 0);
      });
    });
    var buttons = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-prev], [data-hero-next]'));
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        setTimeout(sync, 0);
      });
    });
    setInterval(sync, 600);
    sync();
  });
})();
