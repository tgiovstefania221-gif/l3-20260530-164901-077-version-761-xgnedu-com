(function () {
    var mobileButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startTimer() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector('[data-card-filter]');
    var filterLists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));

    if (filterInput && filterLists.length) {
        function applyFilter() {
            var keyword = filterInput.value.trim().toLowerCase();
            var items = [];

            filterLists.forEach(function (list) {
                items = items.concat(Array.prototype.slice.call(list.children));
            });

            items.forEach(function (item) {
                var text = (item.getAttribute('data-search') || item.textContent || '').toLowerCase();
                item.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
            });
        }

        var query = new URLSearchParams(window.location.search).get('q');

        if (query) {
            filterInput.value = query;
            applyFilter();
        }

        filterInput.addEventListener('input', applyFilter);
    }

    function setupVideo(video) {
        if (!video || video.dataset.ready === '1') {
            return;
        }

        var src = video.getAttribute('data-src');

        if (!src) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
        } else {
            video.src = src;
        }

        video.dataset.ready = '1';
    }

    Array.prototype.slice.call(document.querySelectorAll('.movie-video')).forEach(function (video) {
        var wrap = video.closest('.video-shell');
        var button = wrap ? wrap.querySelector('[data-play-button]') : null;

        if (button) {
            button.addEventListener('click', function () {
                setupVideo(video);
                button.classList.add('hidden');
                var promise = video.play();

                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            });
        }

        video.addEventListener('click', function () {
            setupVideo(video);

            if (video.paused) {
                var promise = video.play();

                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('hidden');
            }
        });
    });
})();
