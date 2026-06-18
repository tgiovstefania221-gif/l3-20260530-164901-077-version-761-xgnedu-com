(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    function setSlide(next) {
      index = next % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("active", current === index);
      });
    }
    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        setSlide(current);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }
  }

  function setupSearch() {
    var input = document.querySelector("[data-global-search]");
    var panel = document.querySelector("[data-search-panel]");
    var data = window.siteSearchData || [];
    if (!input || !panel || !data.length) {
      return;
    }
    function clearPanel() {
      panel.innerHTML = "";
      panel.classList.remove("open");
    }
    function createRow(item) {
      var row = document.createElement("a");
      row.className = "search-result";
      row.href = item.url;
      var img = document.createElement("img");
      img.src = item.cover;
      img.alt = item.title;
      img.loading = "lazy";
      var body = document.createElement("div");
      var title = document.createElement("strong");
      title.textContent = item.title;
      var meta = document.createElement("span");
      meta.textContent = item.year + " · " + item.region + " · " + item.type;
      body.appendChild(title);
      body.appendChild(meta);
      row.appendChild(img);
      row.appendChild(body);
      return row;
    }
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        clearPanel();
        return;
      }
      var results = data.filter(function (item) {
        return item.text.indexOf(keyword) !== -1;
      }).slice(0, 12);
      panel.innerHTML = "";
      results.forEach(function (item) {
        panel.appendChild(createRow(item));
      });
      panel.classList.toggle("open", results.length > 0);
    });
    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        clearPanel();
      }
    });
  }

  function setupLocalFilter() {
    var filter = document.querySelector("[data-local-filter]");
    var grid = document.querySelector("[data-card-grid]");
    if (!filter || !grid) {
      return;
    }
    var keywordInput = filter.querySelector("[data-filter-keyword]");
    var yearSelect = filter.querySelector("[data-filter-year]");
    var regionSelect = filter.querySelector("[data-filter-region]");
    var typeSelect = filter.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    function applyFilter() {
      var keyword = keywordInput.value.trim().toLowerCase();
      var year = yearSelect.value;
      var region = regionSelect.value;
      var type = typeSelect.value;
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var matched = true;
        if (keyword && text.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && card.dataset.year !== year) {
          matched = false;
        }
        if (region && card.dataset.region !== region) {
          matched = false;
        }
        if (type && card.dataset.type !== type) {
          matched = false;
        }
        card.classList.toggle("hidden-card", !matched);
      });
    }
    [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  }

  function setupPlayer() {
    var frames = Array.prototype.slice.call(document.querySelectorAll("[data-video-frame]"));
    frames.forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector("[data-player-start]");
      if (!video || !button) {
        return;
      }
      var stream = video.dataset.stream;
      var loaded = false;
      var hlsInstance = null;
      function loadStream() {
        if (loaded || !stream) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 45,
            enableWorker: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }
      function startPlayback() {
        loadStream();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
        frame.classList.add("playing");
      }
      button.addEventListener("click", startPlayback);
      video.addEventListener("play", function () {
        frame.classList.add("playing");
      });
      video.addEventListener("pause", function () {
        frame.classList.remove("playing");
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function setupImageFallback() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-missing");
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupLocalFilter();
    setupPlayer();
    setupImageFallback();
  });
})();
