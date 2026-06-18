(function () {
  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('open');
      button.textContent = nav.classList.contains('open') ? '×' : '☰';
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');

    if (!slides.length) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
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
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

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

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-page]'));

    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-card-search]');
      var cards = Array.prototype.slice.call(panel.querySelectorAll('[data-card]'));
      var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-value]'));
      var empty = panel.querySelector('[data-empty-state]');
      var activeFilter = 'all';

      function applyFilter() {
        var query = normalize(input ? input.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var searchText = normalize(card.getAttribute('data-search'));
          var genre = normalize(card.getAttribute('data-genre'));
          var filterPass = activeFilter === 'all' || genre.indexOf(normalize(activeFilter)) !== -1 || searchText.indexOf(normalize(activeFilter)) !== -1;
          var searchPass = !query || searchText.indexOf(query) !== -1;
          var shouldShow = filterPass && searchPass;

          card.style.display = shouldShow ? '' : 'none';
          if (shouldShow) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          activeFilter = button.getAttribute('data-filter-value') || 'all';
          buttons.forEach(function (item) {
            item.classList.toggle('active', item === button);
          });
          applyFilter();
        });
      });

      if (panel.hasAttribute('data-query-page') && input) {
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q');
        if (queryValue) {
          input.value = queryValue;
        }
      }

      applyFilter();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
  });
})();
