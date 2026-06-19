(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return '0:00';
    }
    var minutes = Math.floor(seconds / 60);
    var rest = Math.floor(seconds % 60);
    return minutes + ':' + String(rest).padStart(2, '0');
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('[data-header-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;
      var show = function (nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      };
      var start = function () {
        stop();
        timer = setInterval(function () {
          show(index + 1);
        }, 5000);
      };
      var stop = function () {
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      };
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });
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
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var search = scope.querySelector('[data-search-input]');
      var year = scope.querySelector('[data-year-filter]');
      var category = scope.querySelector('[data-category-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      if (!cards.length) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q') || '';
      if (search && search.hasAttribute('data-query-source') && q) {
        search.value = q;
      }
      var apply = function () {
        var term = search ? search.value.trim().toLowerCase() : '';
        var yearValue = year ? year.value : '';
        var categoryValue = category ? category.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-category') || ''
          ].join(' ').toLowerCase();
          var ok = true;
          if (term && haystack.indexOf(term) === -1) {
            ok = false;
          }
          if (yearValue && card.getAttribute('data-year') !== yearValue) {
            ok = false;
          }
          if (categoryValue && card.getAttribute('data-category') !== categoryValue) {
            ok = false;
          }
          card.classList.toggle('is-filtered-out', !ok);
        });
      };
      if (search) {
        search.addEventListener('input', apply);
      }
      if (year) {
        year.addEventListener('change', apply);
      }
      if (category) {
        category.addEventListener('change', apply);
      }
      apply();
    });

    document.querySelectorAll('[data-player]').forEach(function (wrap) {
      var video = wrap.querySelector('video');
      var cover = wrap.querySelector('[data-player-cover]');
      var toggleButton = wrap.querySelector('[data-player-toggle]');
      var muteButton = wrap.querySelector('[data-player-mute]');
      var fullButton = wrap.querySelector('[data-player-fullscreen]');
      var progress = wrap.querySelector('[data-player-progress]');
      var time = wrap.querySelector('[data-player-time]');
      var hls = null;
      var loaded = false;

      if (!video) {
        return;
      }

      var load = function () {
        if (loaded) {
          return;
        }
        loaded = true;
        var src = video.getAttribute('data-hls');
        if (!src) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      };

      var play = function () {
        load();
        if (cover) {
          cover.classList.add('is-hidden');
        }
        var request = video.play();
        if (request && typeof request.catch === 'function') {
          request.catch(function () {});
        }
      };

      var togglePlay = function () {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      };

      if (cover) {
        cover.addEventListener('click', play);
      }
      if (toggleButton) {
        toggleButton.addEventListener('click', togglePlay);
      }
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
        if (toggleButton) {
          toggleButton.textContent = '暂停';
        }
      });
      video.addEventListener('pause', function () {
        if (toggleButton) {
          toggleButton.textContent = '▶';
        }
      });
      video.addEventListener('loadedmetadata', function () {
        if (progress) {
          progress.max = String(video.duration || 0);
        }
      });
      video.addEventListener('timeupdate', function () {
        if (progress && !progress.matches(':active')) {
          progress.value = String(video.currentTime || 0);
        }
        if (time) {
          time.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
        }
      });
      if (progress) {
        progress.addEventListener('input', function () {
          load();
          video.currentTime = Number(progress.value) || 0;
        });
      }
      if (muteButton) {
        muteButton.addEventListener('click', function () {
          video.muted = !video.muted;
          muteButton.textContent = video.muted ? '静音' : '音量';
        });
      }
      if (fullButton) {
        fullButton.addEventListener('click', function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (wrap.requestFullscreen) {
            wrap.requestFullscreen();
          }
        });
      }
      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });

    document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var player = document.querySelector('[data-player]');
        if (player) {
          event.preventDefault();
          player.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var cover = player.querySelector('[data-player-cover]');
          if (cover) {
            cover.click();
          }
        }
      });
    });
  });
})();
