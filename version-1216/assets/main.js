(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-filter-form]').forEach(function (panel) {
    var input = panel.querySelector('[data-search-input]');
    var categorySelect = panel.querySelector('[data-category-select]');
    var yearSelect = panel.querySelector('[data-year-select]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function runFilter() {
      var query = normalize(input ? input.value : '');
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-terms'));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchCategory = !category || card.getAttribute('data-category') === category;
        var matchYear = !year || card.getAttribute('data-year') === year;
        card.classList.toggle('is-hidden', !(matchQuery && matchCategory && matchYear));
      });
    }

    [input, categorySelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', runFilter);
        control.addEventListener('change', runFilter);
      }
    });

    runFilter();
  });
})();
