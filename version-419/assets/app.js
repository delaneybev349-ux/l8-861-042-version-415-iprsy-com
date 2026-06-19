(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-jump]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[type='search']");
        var target = form.getAttribute("data-search-jump") || "./search.html";
        var query = input ? input.value.trim() : "";
        window.location.href = query ? target + "?q=" + encodeURIComponent(query) : target;
      });
    });

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var current = 0;
      var timer = null;

      function setHero(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          setHero(current + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          setHero(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          setHero(current + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          setHero(dotIndex);
          restart();
        });
      });

      setHero(0);
      restart();
    }

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var section = panel.closest("section") || document;
      var grid = section.querySelector("[data-filter-grid]");
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var empty = section.querySelector("[data-empty-state]");
      var cards = grid ? Array.prototype.slice.call(grid.children) : [];
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function same(value, selected) {
        return !selected || value === selected;
      }

      function filterCards() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedRegion = region ? region.value : "";
        var selectedType = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var matches = (!query || haystack.indexOf(query) !== -1) &&
            same(card.getAttribute("data-year") || "", selectedYear) &&
            same(card.getAttribute("data-region") || "", selectedRegion) &&
            same(card.getAttribute("data-type") || "", selectedType);

          card.hidden = !matches;
          if (matches) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filterCards);
          control.addEventListener("change", filterCards);
        }
      });

      filterCards();
    });
  });
})();
