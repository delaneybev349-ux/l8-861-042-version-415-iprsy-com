(function () {
    var mobileToggle = document.querySelector('[data-mobile-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var previousButton = document.querySelector('[data-hero-prev]');
        var nextButton = document.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previousButton) {
            previousButton.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        carousel.addEventListener('mouseenter', stopTimer);
        carousel.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    var filters = document.querySelector('[data-card-filters]');

    if (filters) {
        var searchInput = filters.querySelector('[data-filter-search]');
        var regionSelect = filters.querySelector('[data-filter-region]');
        var typeSelect = filters.querySelector('[data-filter-type]');
        var resetButton = filters.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
        var emptyState = document.querySelector('[data-empty-state]');

        function applyFilters() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var region = regionSelect ? regionSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-year')
                ].join(' ').toLowerCase();
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesRegion = !region || card.getAttribute('data-region') === region;
                var matchesType = !type || card.getAttribute('data-type') === type;
                var isVisible = matchesKeyword && matchesRegion && matchesType;

                card.style.display = isVisible ? '' : 'none';

                if (isVisible) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('show', visible === 0);
            }
        }

        [searchInput, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (searchInput) {
                    searchInput.value = '';
                }
                if (regionSelect) {
                    regionSelect.value = '';
                }
                if (typeSelect) {
                    typeSelect.value = '';
                }
                applyFilters();
            });
        }
    }

    var searchForm = document.querySelector('[data-site-search]');

    if (searchForm && window.SEARCH_MOVIES) {
        var searchKeyword = searchForm.querySelector('[data-search-keyword]');
        var searchRegion = searchForm.querySelector('[data-search-region]');
        var searchType = searchForm.querySelector('[data-search-type]');
        var resultGrid = document.querySelector('[data-search-results]');
        var searchEmpty = document.querySelector('[data-search-empty]');

        function escapeHtml(value) {
            return String(value || '').replace(/[&<>"']/g, function (character) {
                return {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;'
                }[character];
            });
        }

        function movieCard(movie) {
            return [
                '<article class="movie-card">',
                '<a class="card-cover" href="' + escapeHtml(movie.file) + '">',
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">',
                '<span class="play-mask"><span class="play-icon">▶</span></span>',
                '<span class="card-ribbon badge badge-amber">' + escapeHtml(movie.region) + '</span>',
                '<span class="card-year badge badge-dark">' + escapeHtml(movie.year) + '</span>',
                '</a>',
                '<div class="card-body">',
                '<h3 class="card-title"><a href="' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '<p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
                '<div class="card-foot"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function runSearch() {
            var keyword = searchKeyword ? searchKeyword.value.trim().toLowerCase() : '';
            var region = searchRegion ? searchRegion.value : '';
            var type = searchType ? searchType.value : '';
            var results = window.SEARCH_MOVIES.filter(function (movie) {
                var text = [movie.title, movie.oneLine, movie.genre, movie.tags, movie.year].join(' ').toLowerCase();
                return (!keyword || text.indexOf(keyword) !== -1) && (!region || movie.region === region) && (!type || movie.type === type);
            }).slice(0, 60);

            if (resultGrid) {
                resultGrid.innerHTML = results.map(movieCard).join('');
            }

            if (searchEmpty) {
                searchEmpty.classList.toggle('show', results.length === 0);
            }
        }

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            runSearch();
        });

        [searchKeyword, searchRegion, searchType].forEach(function (control) {
            if (control) {
                control.addEventListener('input', runSearch);
                control.addEventListener('change', runSearch);
            }
        });

        runSearch();
    }
}());

function setupPlayer(sourceUrl) {
    var video = document.querySelector('[data-player-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var initialized = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
        return;
    }

    function initialize() {
        if (initialized) {
            return;
        }

        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    }

    function beginPlayback() {
        initialize();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        video.controls = true;
        video.play().catch(function () {
            if (overlay) {
                overlay.classList.remove('is-hidden');
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', beginPlayback);
    }

    video.addEventListener('click', function () {
        if (!initialized || video.paused) {
            beginPlayback();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
