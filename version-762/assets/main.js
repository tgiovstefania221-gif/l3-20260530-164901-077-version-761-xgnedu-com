(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var carousel = document.querySelector(".hero-carousel");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector(".hero-prev");
    var next = carousel.querySelector(".hero-next");
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-index")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    restart();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    var yearSelect = document.querySelector("[data-year-filter]");
    var typeSelect = document.querySelector("[data-type-filter]");
    var categorySelect = document.querySelector("[data-category-filter]");
    var count = document.querySelector("[data-result-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    if (!cards.length || (!input && !yearSelect && !typeSelect && !categorySelect)) {
      return;
    }

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var year = normalize(yearSelect ? yearSelect.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var category = normalize(categorySelect ? categorySelect.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.genre,
          card.dataset.tags,
          card.dataset.year,
          card.dataset.type,
          card.dataset.category,
          card.dataset.region,
          card.textContent
        ].join(" "));
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesYear = !year || normalize(card.dataset.year).indexOf(year) !== -1;
        var matchesType = !type || normalize(card.dataset.type) === type;
        var matchesCategory = !category || normalize(card.dataset.category) === category;
        var shouldShow = matchesKeyword && matchesYear && matchesType && matchesCategory;
        card.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + " 部";
      }
    }

    [input, yearSelect, typeSelect, categorySelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });

    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
