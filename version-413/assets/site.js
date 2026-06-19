(function () {
    var body = document.body;
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
            body.classList.toggle('no-scroll', menu.classList.contains('is-open'));
        });
    }

    document.querySelectorAll('[data-global-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            var url = './category-all.html';
            if (query) {
                url += '?search=' + encodeURIComponent(query);
            }
            window.location.href = url;
        });
    });

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
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

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function applyFilters(root) {
        var input = root.querySelector('[data-filter-input]');
        var year = root.querySelector('[data-year-filter]');
        var type = root.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-card-list] .movie-card, [data-card-list] .ranking-row'));
        var empty = root.querySelector('[data-empty-state]');
        var query = normalize(input ? input.value : '');
        var yearValue = normalize(year ? year.value : '');
        var typeValue = normalize(type ? type.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-keywords'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type')
            ].join(' '));
            var cardYear = normalize(card.getAttribute('data-year'));
            var cardType = normalize(card.getAttribute('data-type'));
            var matched = true;

            if (query && haystack.indexOf(query) === -1) {
                matched = false;
            }
            if (yearValue && cardYear.indexOf(yearValue) === -1) {
                matched = false;
            }
            if (typeValue && cardType.indexOf(typeValue) === -1) {
                matched = false;
            }

            card.classList.toggle('is-filtered-out', !matched);
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0 && cards.length > 0);
        }
    }

    document.querySelectorAll('main').forEach(function (root) {
        var input = root.querySelector('[data-filter-input]');
        var year = root.querySelector('[data-year-filter]');
        var type = root.querySelector('[data-type-filter]');
        if (!input && !year && !type) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var search = params.get('search');
        if (input && search) {
            input.value = search;
        }
        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', function () {
                    applyFilters(root);
                });
                control.addEventListener('change', function () {
                    applyFilters(root);
                });
            }
        });
        applyFilters(root);
    });

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video[data-video-src]');
        var trigger = player.querySelector('[data-play-trigger]');

        function prepare() {
            if (!video || video.getAttribute('data-ready') === '1') {
                return;
            }
            var src = video.getAttribute('data-video-src');
            if (!src) {
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                video._hls = hls;
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            }
            video.setAttribute('data-ready', '1');
        }

        function play() {
            prepare();
            if (trigger) {
                trigger.classList.add('is-hidden');
            }
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (trigger) {
            trigger.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('play', function () {
                if (trigger) {
                    trigger.classList.add('is-hidden');
                }
            });
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });
        }
    });
})();
