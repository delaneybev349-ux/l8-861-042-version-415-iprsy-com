document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.querySelector(".mobile-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("hidden");
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("opacity-100", i === index);
        slide.classList.toggle("opacity-0", i !== index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("w-8", i === index);
        dot.classList.toggle("bg-mystery-500", i === index);
        dot.classList.toggle("w-6", i !== index);
        dot.classList.toggle("bg-dark-600", i !== index);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  });

  document.querySelectorAll(".category-filter").forEach(function (input) {
    var scope = input.closest("section");
    var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll(".movie-card")) : [];

    input.addEventListener("input", function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-filter") || "").toLowerCase();
        card.hidden = query && text.indexOf(query) === -1;
      });
    });
  });
});
