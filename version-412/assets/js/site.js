(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-filter-empty]');
    var localSearch = document.querySelector('[data-local-search]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var regionFilter = document.querySelector('[data-region-filter]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function onScroll() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 30);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    function applyFilter(value) {
        var query = normalize(value);
        var year = yearFilter ? yearFilter.value : '';
        var region = regionFilter ? regionFilter.value : '';
        var shown = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cardYear = card.getAttribute('data-year') || '';
            var cardRegion = card.getAttribute('data-region') || '';
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchYear = !year || cardYear === year;
            var matchRegion = !region || cardRegion === region;
            var visible = matchQuery && matchYear && matchRegion;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                shown += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', shown === 0);
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('[data-search-input]');
            var value = input ? input.value.trim() : '';
            if (cards.length) {
                event.preventDefault();
                if (localSearch) {
                    localSearch.value = value;
                }
                applyFilter(value);
                window.history.replaceState(null, '', value ? '?search=' + encodeURIComponent(value) : window.location.pathname);
            }
        });
    });

    if (localSearch) {
        localSearch.addEventListener('input', function () {
            applyFilter(localSearch.value);
        });
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', function () {
            applyFilter(localSearch ? localSearch.value : '');
        });
    }

    if (regionFilter) {
        regionFilter.addEventListener('change', function () {
            applyFilter(localSearch ? localSearch.value : '');
        });
    }

    var params = new URLSearchParams(window.location.search);
    var initialSearch = params.get('search') || '';
    if (initialSearch && cards.length) {
        if (localSearch) {
            localSearch.value = initialSearch;
        }
        Array.prototype.slice.call(document.querySelectorAll('[data-search-input]')).forEach(function (input) {
            input.value = initialSearch;
        });
        applyFilter(initialSearch);
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function activate(next) {
        if (!slides.length) {
            return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === index);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            activate(dotIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            activate(index + 1);
        }, 5200);
    }
})();
