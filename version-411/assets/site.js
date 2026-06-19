(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function initHeader() {
    var header = document.querySelector('[data-header]');
    var button = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (header) {
      var updateHeader = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 12);
      };
      updateHeader();
      window.addEventListener('scroll', updateHeader, { passive: true });
    }

    if (button && mobileNav) {
      button.addEventListener('click', function () {
        button.classList.toggle('is-open');
        mobileNav.classList.toggle('is-open');
      });
    }
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
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
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(nextIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));
    if (!lists.length) {
      return;
    }

    lists.forEach(function (list) {
      var scope = list.closest('section') || document;
      var input = scope.querySelector('[data-search-input]');
      var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-select]'));
      var reset = scope.querySelector('[data-reset-filter]');
      var empty = scope.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (input && query) {
        input.value = query;
      }

      function matches(card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();
        var keyword = input ? input.value.trim().toLowerCase() : '';

        if (keyword && text.indexOf(keyword) === -1) {
          return false;
        }

        for (var i = 0; i < selects.length; i += 1) {
          var select = selects[i];
          var key = select.getAttribute('data-filter-select');
          var value = select.value;
          var cardValue = card.getAttribute('data-' + key) || '';
          if (value && cardValue !== value) {
            return false;
          }
        }

        return true;
      }

      function apply() {
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          selects.forEach(function (select) {
            select.value = '';
          });
          apply();
        });
      }
      apply();
    });
  }

  function initPlayer() {
    var video = document.querySelector('[data-hls-src]');
    var startButton = document.querySelector('[data-player-start]');
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-hls-src');
    var initialized = false;

    function setup() {
      if (initialized || !source) {
        return;
      }
      initialized = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    setup();

    if (startButton) {
      startButton.addEventListener('click', function () {
        setup();
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
        startButton.classList.add('is-hidden');
      });
    }

    video.addEventListener('play', function () {
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    });
  }

  ready(function () {
    initHeader();
    initHero();
    initFilters();
    initPlayer();
  });
}());
