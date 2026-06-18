(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMobileNav();
    initHeroSlider();
    initPageSearch();
  });

  function initMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHeroSlider() {
    var root = document.querySelector("[data-hero-slider]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot") || 0));
        start();
      });
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function initPageSearch() {
    var containers = Array.prototype.slice.call(document.querySelectorAll("[data-page-search]"));
    containers.forEach(function (container) {
      var input = container.querySelector("[data-search-input]");
      var region = container.querySelector("[data-filter-region]");
      var year = container.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
      var empty = container.querySelector("[data-empty-state]");
      if (!input && !region && !year) {
        return;
      }

      function matchYear(cardYear, selected) {
        var numericYear = Number(cardYear || 0);
        if (!selected) {
          return true;
        }
        if (selected === "2025") {
          return numericYear >= 2025;
        }
        if (selected === "2020") {
          return numericYear >= 2020 && numericYear <= 2024;
        }
        if (selected === "2015") {
          return numericYear >= 2015 && numericYear <= 2019;
        }
        if (selected === "old") {
          return numericYear <= 2014;
        }
        return true;
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardRegion = card.getAttribute("data-region") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var isMatch = true;
          if (query && text.indexOf(query) === -1) {
            isMatch = false;
          }
          if (regionValue && cardRegion.indexOf(regionValue) === -1) {
            isMatch = false;
          }
          if (!matchYear(cardYear, yearValue)) {
            isMatch = false;
          }
          card.classList.toggle("is-hidden", !isMatch);
          if (isMatch) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }

      [input, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }
})();

function setupMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var cover = document.getElementById(options.coverId);
  var button = document.getElementById(options.buttonId);
  var source = options.source;
  var hls = null;
  var loaded = false;

  if (!video || !cover || !button || !source) {
    return;
  }

  function loadSource() {
    if (loaded) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      loaded = true;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      loaded = true;
      return;
    }
    video.src = source;
    loaded = true;
  }

  function startPlayback(event) {
    if (event) {
      event.preventDefault();
    }
    loadSource();
    cover.classList.add("hidden");
    video.setAttribute("controls", "controls");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  cover.addEventListener("click", startPlayback);
  button.addEventListener("click", startPlayback);
  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
}
