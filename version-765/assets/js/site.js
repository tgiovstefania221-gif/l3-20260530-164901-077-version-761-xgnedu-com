(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  window.handleImageError = function handleImageError(img) {
    img.classList.add('is-missing');
    img.removeAttribute('src');
  };

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.getElementById('mainNav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.dataset.heroDot));
        start();
      });
    });
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupCardFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var search = scope.querySelector('[data-card-search]');
      var yearFilter = scope.querySelector('[data-year-filter]');
      var regionFilter = scope.querySelector('[data-region-filter]');
      var reset = scope.querySelector('[data-filter-reset]');
      var section = scope.closest('.section-wrap') || document;
      var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card-list] .movie-card, [data-card-list] .rank-table-row'));
      var count = section.querySelector('[data-result-count]');

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function applyFilter() {
        var keyword = normalize(search && search.value);
        var year = normalize(yearFilter && yearFilter.value);
        var region = normalize(regionFilter && regionFilter.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));
          var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchYear = !year || normalize(card.dataset.year) === year;
          var matchRegion = !region || normalize(card.dataset.region) === region;
          var matched = matchKeyword && matchYear && matchRegion;
          card.classList.toggle('hidden-by-filter', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '共 ' + visible + ' 部';
        }
      }

      [search, yearFilter, regionFilter].forEach(function (element) {
        if (element) {
          element.addEventListener('input', applyFilter);
          element.addEventListener('change', applyFilter);
        }
      });
      if (reset) {
        reset.addEventListener('click', function () {
          if (search) search.value = '';
          if (yearFilter) yearFilter.value = '';
          if (regionFilter) regionFilter.value = '';
          applyFilter();
        });
      }
      applyFilter();
    });
  }

  function setupGlobalSearch() {
    var results = document.getElementById('globalSearchResults');
    if (!results || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var input = document.getElementById('globalSearchInput');
    var category = document.getElementById('globalCategoryFilter');
    var year = document.getElementById('globalYearFilter');
    var reset = document.getElementById('globalSearchReset');
    var count = document.getElementById('globalSearchCount');
    var data = window.MOVIE_SEARCH_INDEX.slice();

    var years = Array.from(new Set(data.map(function (item) { return item.year; })))
      .filter(Boolean)
      .sort(function (a, b) { return b - a; });

    years.forEach(function (value) {
      var option = document.createElement('option');
      option.value = String(value);
      option.textContent = String(value);
      year.appendChild(option);
    });

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function createCard(item) {
      var tags = Array.isArray(item.tags) ? item.tags.slice(0, 5).join(' ') : '';
      return [
        '<article class="movie-card">',
        '  <a class="poster-frame" href="' + item.url + '" aria-label="查看' + escapeHtml(item.title) + '">',
        '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="handleImageError(this)">',
        '    <span class="poster-badge">' + escapeHtml(item.year) + '</span>',
        '    <span class="poster-play">▶</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-meta-row"><span>' + escapeHtml(item.category) + '</span><span>⭐ ' + escapeHtml(item.rating) + '</span></div>',
        '    <h3><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h3>',
        '    <p>' + escapeHtml(item.oneLine) + '</p>',
        '    <div class="card-foot"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function applySearch() {
      var keyword = normalize(input.value);
      var categoryValue = normalize(category.value);
      var yearValue = normalize(year.value);
      var filtered = data.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.category,
          Array.isArray(item.tags) ? item.tags.join(' ') : '',
          item.oneLine
        ].join(' '));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchCategory = !categoryValue || normalize(item.category) === categoryValue;
        var matchYear = !yearValue || String(item.year) === yearValue;
        return matchKeyword && matchCategory && matchYear;
      });

      count.textContent = '共找到 ' + filtered.length + ' 部，当前显示前 ' + Math.min(filtered.length, 120) + ' 部';
      results.innerHTML = filtered.slice(0, 120).map(createCard).join('');
    }

    [input, category, year].forEach(function (element) {
      element.addEventListener('input', applySearch);
      element.addEventListener('change', applySearch);
    });
    reset.addEventListener('click', function () {
      input.value = '';
      category.value = '';
      year.value = '';
      applySearch();
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) {
      input.value = q;
    }
    applySearch();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupCardFilters();
    setupGlobalSearch();
  });
})();
