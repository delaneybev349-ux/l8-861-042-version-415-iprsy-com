(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var previous = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      clearInterval(timer);
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  document.querySelectorAll('[data-scroll-left], [data-scroll-right]').forEach(function (button) {
    button.addEventListener('click', function () {
      var targetId = button.getAttribute('data-target');
      var target = document.getElementById(targetId);
      var direction = button.hasAttribute('data-scroll-left') ? -1 : 1;

      if (target) {
        target.scrollBy({
          left: direction * 420,
          behavior: 'smooth'
        });
      }
    });
  });

  var searchInput = document.querySelector('[data-site-search]');
  var typeSelect = document.querySelector('[data-type-filter]');
  var regionSelect = document.querySelector('[data-region-filter]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function normalizeText(value) {
    return String(value || '').toLowerCase().trim();
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var keyword = normalizeText(searchInput ? searchInput.value : '');
    var typeValue = normalizeText(typeSelect ? typeSelect.value : '');
    var regionValue = normalizeText(regionSelect ? regionSelect.value : '');
    var activeButton = document.querySelector('[data-filter-value].active');
    var quickValue = normalizeText(activeButton ? activeButton.getAttribute('data-filter-value') : '');
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalizeText([
        card.getAttribute('data-title'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));

      var cardType = normalizeText(card.getAttribute('data-type'));
      var cardRegion = normalizeText(card.getAttribute('data-region'));
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedType = !typeValue || cardType === typeValue;
      var matchedRegion = !regionValue || cardRegion === regionValue;
      var matchedQuick = !quickValue || text.indexOf(quickValue) !== -1;
      var matched = matchedKeyword && matchedType && matchedRegion && matchedQuick;

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('show', visible === 0);
    }
  }

  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query) {
      searchInput.value = query;
    }

    searchInput.addEventListener('input', filterCards);
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', filterCards);
  }

  if (regionSelect) {
    regionSelect.addEventListener('change', filterCards);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('active');
      });
      button.classList.add('active');
      filterCards();
    });
  });

  filterCards();

  function beginVideo(holder) {
    var video = holder.querySelector('video');
    var button = holder.querySelector('.player-start');
    var stream = holder.getAttribute('data-stream');

    if (!video || !stream) {
      return;
    }

    if (video.getAttribute('data-ready') === 'true') {
      var repeated = video.play();
      if (repeated && repeated.catch) {
        repeated.catch(function () {});
      }
      return;
    }

    video.setAttribute('data-ready', 'true');

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      var nativePlay = video.play();
      if (nativePlay && nativePlay.catch) {
        nativePlay.catch(function () {});
      }
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        var hlsPlay = video.play();
        if (hlsPlay && hlsPlay.catch) {
          hlsPlay.catch(function () {});
        }
      });
    } else {
      video.src = stream;
      var fallbackPlay = video.play();
      if (fallbackPlay && fallbackPlay.catch) {
        fallbackPlay.catch(function () {});
      }
    }

    if (button) {
      button.classList.add('is-hidden');
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (holder) {
    var video = holder.querySelector('video');
    var button = holder.querySelector('.player-start');

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        beginVideo(holder);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        beginVideo(holder);
      });
      video.addEventListener('playing', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  });
})();
