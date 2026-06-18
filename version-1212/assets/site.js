(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    var play = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        play();
      });
    }

    showSlide(0);
    play();
  }

  var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

  scopes.forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-empty-state]');
    var filterButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-value]'));
    var resetButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-reset]'));

    var applyFilter = function (value) {
      var keyword = String(value || '').trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = String(card.getAttribute('data-search') || '').toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden-card', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    if (input) {
      input.addEventListener('input', function () {
        applyFilter(input.value);
      });
    }

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter-value') || '';

        if (input) {
          input.value = value;
        }

        applyFilter(value);
      });
    });

    resetButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }

        applyFilter('');
      });
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var url = player.getAttribute('data-video-url');
    var hls = null;
    var prepared = false;

    var prepare = function () {
      if (!video || !url || prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    };

    var start = function () {
      prepare();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (video) {
        var result = video.play();

        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            if (cover) {
              cover.classList.remove('is-hidden');
            }
          });
        }
      }
    };

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused && !prepared) {
          start();
        }
      });
    }
  });
})();
