(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-thumb]'));
    var current = 0;
    var timer = null;

    function setHero(index) {
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

      thumbs.forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        setHero(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setHero(Number(dot.getAttribute('data-hero-dot')));
        startHero();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        setHero(Number(thumb.getAttribute('data-hero-thumb')));
        startHero();
      });
    });

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panel) {
    var scope = panel.closest('section') || document;
    var list = scope.querySelector('[data-filter-list]');
    var empty = scope.querySelector('[data-empty-state]');
    var input = panel.querySelector('[data-filter-search]');
    var year = panel.querySelector('[data-filter-year]');
    var region = panel.querySelector('[data-filter-region]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var selectedYear = normalize(year && year.value);
      var selectedRegion = normalize(region && region.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-tags')
        ].join(' '));
        var cardYear = normalize(card.getAttribute('data-year'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var ok = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          ok = false;
        }

        if (selectedYear && cardYear !== selectedYear) {
          ok = false;
        }

        if (selectedRegion && cardRegion.indexOf(selectedRegion) === -1) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('visible', visible === 0);
      }
    }

    [input, year, region].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input) {
      input.value = q;
      applyFilter();
    }
  });
})();
