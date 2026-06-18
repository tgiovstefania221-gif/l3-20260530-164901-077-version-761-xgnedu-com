(function () {
    var header = document.querySelector('[data-site-header]');
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 20) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (toggle && header && mobileNav) {
        toggle.addEventListener('click', function () {
            header.classList.toggle('is-open');
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

        function activate(nextIndex) {
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

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                activate(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                activate(dotIndex);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                activate(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                activate(index + 1);
                restart();
            });
        }

        restart();
    }

    var globalSearch = document.querySelector('[data-global-search]');
    if (globalSearch) {
        globalSearch.addEventListener('submit', function (event) {
            var input = globalSearch.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = 'ranking.html';
            }
        });
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');
    var typeValue = '全部';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function textOf(card) {
        return [
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.tags
        ].join(' ').toLowerCase();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }
        var query = filterInput ? normalize(filterInput.value) : '';
        var shown = 0;
        cards.forEach(function (card) {
            var matchesText = !query || textOf(card).indexOf(query) !== -1;
            var matchesType = typeValue === '全部' || normalize(card.dataset.type).indexOf(normalize(typeValue)) !== -1;
            var visible = matchesText && matchesType;
            card.classList.toggle('hidden-card', !visible);
            if (visible) {
                shown += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle('show', shown === 0);
        }
    }

    if (filterInput) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');
        if (initial) {
            filterInput.value = initial;
        }
        filterInput.addEventListener('input', applyFilter);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            typeValue = button.dataset.filterValue || '全部';
            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            applyFilter();
        });
    });

    applyFilter();
})();
