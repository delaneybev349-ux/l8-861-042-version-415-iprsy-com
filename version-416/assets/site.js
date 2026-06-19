(function () {
    var mobileButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
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
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(active + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

        scopes.forEach(function (scope) {
            var input = scope.querySelector('[data-filter-search]');
            var chips = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
            var activeValue = '';

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : '';
                var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

                cards.forEach(function (card) {
                    var text = (card.getAttribute('data-meta') || card.textContent || '').toLowerCase();
                    var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                    var chipMatch = !activeValue || text.indexOf(activeValue.toLowerCase()) !== -1;
                    card.classList.toggle('is-hidden', !(keywordMatch && chipMatch));
                });
            }

            if (input) {
                input.addEventListener('input', apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q');
                if (q) {
                    input.value = q;
                }
            }

            chips.forEach(function (chip) {
                chip.addEventListener('click', function () {
                    activeValue = chip.getAttribute('data-filter-value') || '';
                    chips.forEach(function (item) {
                        item.classList.toggle('active', item === chip);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

        shells.forEach(function (shell) {
            var video = shell.querySelector('.js-video');
            var overlay = shell.querySelector('.js-play');
            var src = shell.getAttribute('data-stream');
            var hls = null;

            if (!video || !overlay || !src) {
                return;
            }

            function loadStream() {
                if (video.getAttribute('data-ready') === '1') {
                    return;
                }

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                    video.setAttribute('data-ready', '1');
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        var promise = video.play();
                        if (promise && promise.catch) {
                            promise.catch(function () {});
                        }
                    });
                    video.setAttribute('data-ready', '1');
                    return;
                }

                video.src = src;
                video.setAttribute('data-ready', '1');
            }

            function play() {
                overlay.classList.add('is-hidden');
                video.controls = true;
                loadStream();
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            overlay.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                }
            });

            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
