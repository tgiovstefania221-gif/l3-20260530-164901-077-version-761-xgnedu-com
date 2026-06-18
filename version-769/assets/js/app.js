(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function trimText(value, size) {
    var text = String(value || '').replace(/\s+/g, ' ').trim();
    return text.length > size ? text.slice(0, size).replace(/\s+$/, '') + '…' : text;
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    if (!toggle) {
      return;
    }
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('is-menu-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        show(idx);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initSearch() {
    var input = qs('#searchInput');
    var results = qs('#searchResults');
    var status = qs('#searchStatus');
    var button = qs('#searchButton');
    var data = window.MOVIE_SEARCH_DATA || [];
    if (!input || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(query) {
      var key = query.trim().toLowerCase();
      var list = key
        ? data.filter(function (item) {
            var text = [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine, item.summary].join(' ').toLowerCase();
            return text.indexOf(key) !== -1;
          }).slice(0, 80)
        : data.slice(0, 24);

      if (status) {
        status.textContent = key ? '相关影片' : '推荐影片';
      }

      if (!list.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配的影片，可尝试更换关键词。</div>';
        return;
      }

      results.innerHTML = list.map(function (item) {
        return [
          '<article class="movie-card">',
          '  <a class="movie-card__poster" href="' + escapeHtml(item.url) + '" aria-label="' + escapeHtml(item.title) + '">',
          '    <img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.remove()">',
          '    <span class="movie-card__play">▶</span>',
          '  </a>',
          '  <div class="movie-card__body">',
          '    <h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>',
          '    <p>' + escapeHtml(trimText(item.oneLine || item.summary, 80)) + '</p>',
          '    <div class="movie-meta">',
          '      <span>' + escapeHtml(item.year) + '</span>',
          '      <span>' + escapeHtml(item.region) + '</span>',
          '      <span>' + escapeHtml(item.type) + '</span>',
          '    </div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');
    }

    function updateAddress(query) {
      var url = new URL(window.location.href);
      if (query.trim()) {
        url.searchParams.set('q', query.trim());
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url.toString());
    }

    input.addEventListener('input', function () {
      render(input.value);
      updateAddress(input.value);
    });

    if (button) {
      button.addEventListener('click', function () {
        render(input.value);
        updateAddress(input.value);
      });
    }

    render(initial);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initSearch();
  });
})();
