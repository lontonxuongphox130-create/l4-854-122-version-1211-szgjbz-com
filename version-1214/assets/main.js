(function () {
  const toggle = document.querySelector('[data-nav-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    const next = document.querySelector('[data-hero-next]');
    const prev = document.querySelector('[data-hero-prev]');

    if (!slides.length) {
      return;
    }

    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
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
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        start();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    show(0);
    start();
  }

  function setupFiltering() {
    const input = document.querySelector('[data-filter-input]');
    const sort = document.querySelector('[data-sort-select]');
    const grid = document.querySelector('[data-card-grid]');

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll('.movie-card'));

    function applyFilter() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      cards.forEach(function (card) {
        const haystack = [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(' ').toLowerCase();
        card.classList.toggle('hidden-by-filter', keyword && !haystack.includes(keyword));
      });
    }

    function applySort() {
      if (!sort) {
        return;
      }
      const value = sort.value;
      const sorted = cards.slice().sort(function (a, b) {
        if (value === 'heat') {
          return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
        }
        if (value === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (value === 'title') {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        }
        return 0;
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (sort) {
      sort.addEventListener('change', applySort);
    }
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    const form = document.querySelector('[data-search-form]');
    const input = document.querySelector('[data-search-query]');
    const region = document.querySelector('[data-search-region]');
    const type = document.querySelector('[data-search-type]');
    const results = document.querySelector('[data-search-results]');
    const note = document.querySelector('[data-search-note]');

    if (!form || !input || !results || !window.SITE_MOVIES) {
      return;
    }

    function render() {
      const keyword = input.value.trim().toLowerCase();
      const regionValue = region ? region.value : '';
      const typeValue = type ? type.value : '';
      const movies = window.SITE_MOVIES.filter(function (movie) {
        const haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
          .join(' ')
          .toLowerCase();
        if (keyword && !haystack.includes(keyword)) {
          return false;
        }
        if (regionValue && movie.region !== regionValue) {
          return false;
        }
        if (typeValue && movie.type !== typeValue) {
          return false;
        }
        return true;
      }).slice(0, 120);

      results.innerHTML = movies.map(function (movie) {
        return [
          '<article class="movie-card">',
          '  <a class="movie-poster" href="' + escapeHTML(movie.link) + '">',
          '    <img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">',
          '    <span class="poster-gradient"></span>',
          '    <span class="score">' + escapeHTML(movie.score) + '</span>',
          '  </a>',
          '  <div class="movie-info">',
          '    <h3><a href="' + escapeHTML(movie.link) + '">' + escapeHTML(movie.title) + '</a></h3>',
          '    <p class="movie-meta">' + escapeHTML(movie.region) + ' · ' + escapeHTML(movie.type) + ' · ' + escapeHTML(movie.year) + '</p>',
          '    <p class="movie-line">' + escapeHTML(movie.oneLine) + '</p>',
          '    <div class="tag-row"><span>' + escapeHTML(movie.genre) + '</span></div>',
          '  </div>',
          '</article>'
        ].join('');
      }).join('');

      if (note) {
        note.textContent = '已显示 ' + movies.length + ' 条结果。';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render();
    });
    input.addEventListener('input', render);
    if (region) {
      region.addEventListener('change', render);
    }
    if (type) {
      type.addEventListener('change', render);
    }
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupHero();
    setupFiltering();
    setupSearchPage();
  });
})();
