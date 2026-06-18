
(function () {
  var base = document.body.getAttribute('data-base') || './';
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.getElementById('mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function makeSearchItem(item) {
    var link = document.createElement('a');
    link.className = 'search-item';
    link.href = base + item.page;

    var img = document.createElement('img');
    img.src = base + item.cover;
    img.alt = item.title;

    var info = document.createElement('span');
    var title = document.createElement('strong');
    title.textContent = item.title;
    var meta = document.createElement('small');
    meta.textContent = item.year + ' · ' + item.region + ' · ' + item.type;
    var line = document.createElement('small');
    line.textContent = item.line;

    info.appendChild(title);
    info.appendChild(meta);
    info.appendChild(line);
    link.appendChild(img);
    link.appendChild(info);
    return link;
  }

  function bindSearch(inputId, resultsId, limit) {
    var input = document.getElementById(inputId);
    var results = document.getElementById(resultsId);
    var list = window.SEARCH_MOVIES || [];
    if (!input || !results || !list.length) {
      return;
    }

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      results.innerHTML = '';
      if (!q) {
        results.hidden = true;
        return;
      }

      var matches = list.filter(function (item) {
        var text = [item.title, item.year, item.region, item.type, item.genre, item.line].concat(item.tags || []).join(' ').toLowerCase();
        return text.indexOf(q) !== -1;
      }).slice(0, limit || 12);

      if (!matches.length) {
        var empty = document.createElement('div');
        empty.className = 'search-item';
        empty.textContent = '未找到相关影片';
        results.appendChild(empty);
      } else {
        matches.forEach(function (item) {
          results.appendChild(makeSearchItem(item));
        });
      }
      results.hidden = false;
    });

    document.addEventListener('click', function (event) {
      if (!results.contains(event.target) && event.target !== input) {
        results.hidden = true;
      }
    });
  }

  bindSearch('global-search', 'global-search-results', 10);
  bindSearch('home-search', 'home-search-results', 18);

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var categorySearch = document.getElementById('category-search');
  var yearFilter = document.getElementById('year-filter');
  var typeFilter = document.getElementById('type-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-list .movie-card'));

  function applyFilters() {
    var q = categorySearch ? categorySearch.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';

    cards.forEach(function (card) {
      var text = [card.dataset.title, card.dataset.type, card.dataset.tags, card.dataset.year].join(' ').toLowerCase();
      var matched = (!q || text.indexOf(q) !== -1) && (!year || card.dataset.year === year) && (!type || card.dataset.type === type);
      card.style.display = matched ? '' : 'none';
    });
  }

  if (cards.length) {
    [categorySearch, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
  }
})();
