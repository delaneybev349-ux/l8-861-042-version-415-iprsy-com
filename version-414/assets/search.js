document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("search-form");
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var params = new URLSearchParams(window.location.search);
  var initial = params.get("q") || "";

  function card(item) {
    var tags = (item.tags || []).slice(0, 2).map(function (tag) {
      return '<span class="px-2 py-0.5 bg-mystery-600/80 backdrop-blur-sm text-white text-xs rounded">' + escapeHtml(tag) + '</span>';
    }).join("");

    return '<a href="' + escapeHtml(item.url) + '" class="movie-card group block rounded-xl overflow-hidden shadow-soft hover:shadow-glow transition-all duration-300 transform hover:-translate-y-1 bg-dark-900">' +
      '<div class="aspect-[3/4] relative overflow-hidden">' +
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">' +
      '<div class="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>' +
      '<div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span class="w-12 h-12 rounded-full bg-mystery-600/90 flex items-center justify-center backdrop-blur-sm text-white">▶</span></div>' +
      '<div class="absolute bottom-0 left-0 right-0 p-4"><div class="flex flex-wrap gap-1 mb-2">' + tags + '</div></div>' +
      '</div>' +
      '<div class="p-4">' +
      '<h3 class="text-white font-semibold mb-2 line-clamp-2 group-hover:text-mystery-400 transition-colors">' + escapeHtml(item.title) + '</h3>' +
      '<p class="text-dark-400 text-sm line-clamp-2 mb-3">' + escapeHtml(item.oneLine) + '</p>' +
      '<div class="flex items-center justify-between text-sm"><span class="text-dark-500">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + '</span></div>' +
      '</div>' +
      '</a>';
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function render(query) {
    var q = query.trim().toLowerCase();

    if (!q) {
      return;
    }

    var list = (window.siteMovies || []).filter(function (item) {
      var haystack = [item.title, item.oneLine, item.year, item.region, item.type, item.genre, (item.tags || []).join(" ")].join(" ").toLowerCase();
      return haystack.indexOf(q) !== -1;
    }).slice(0, 120);

    if (!list.length) {
      results.innerHTML = '<div class="search-empty">没有找到匹配内容</div>';
      return;
    }

    results.innerHTML = list.map(card).join("");
  }

  if (input && initial) {
    input.value = initial;
    render(initial);
  }

  if (form && input) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input.value.trim();
      var url = value ? ("search.html?q=" + encodeURIComponent(value)) : "search.html";
      window.history.replaceState(null, "", url);
      render(value);
    });

    input.addEventListener("input", function () {
      render(input.value);
    });
  }
});
