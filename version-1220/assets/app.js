(function () {
    const toggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.site-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('.hero-slide'));
    const dots = Array.from(document.querySelectorAll('.hero-dot'));
    let activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    const prev = document.querySelector('.hero-prev');
    const next = document.querySelector('.hero-next');
    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(activeSlide - 1);
        });
    }
    if (next) {
        next.addEventListener('click', function () {
            showSlide(activeSlide + 1);
        });
    }
    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });
    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5800);
    }

    const inputs = Array.from(document.querySelectorAll('.js-search-input'));
    const cards = Array.from(document.querySelectorAll('.movie-card'));
    const noResult = document.querySelector('.no-result');
    const pills = Array.from(document.querySelectorAll('.filter-pill'));
    let currentType = 'all';

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        const query = normalize(inputs.map(function (input) { return input.value; }).join(' '));
        let visible = 0;
        cards.forEach(function (card) {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.type,
                card.textContent
            ].join(' '));
            const typeMatch = currentType === 'all' || normalize(card.dataset.type) === normalize(currentType);
            const queryMatch = !query || haystack.indexOf(query) !== -1;
            const ok = typeMatch && queryMatch;
            card.hidden = !ok;
            if (ok) {
                visible += 1;
            }
        });
        if (noResult) {
            noResult.classList.toggle('is-visible', visible === 0);
        }
    }

    inputs.forEach(function (input) {
        input.addEventListener('input', applyFilters);
    });

    pills.forEach(function (pill) {
        pill.addEventListener('click', function () {
            currentType = pill.getAttribute('data-type-filter') || 'all';
            pills.forEach(function (item) {
                item.classList.toggle('is-active', item === pill);
            });
            applyFilters();
        });
    });
})();
