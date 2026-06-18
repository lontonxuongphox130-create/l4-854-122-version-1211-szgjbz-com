(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const navPanel = document.querySelector('[data-nav-panel]');

    if (navToggle && navPanel) {
        navToggle.addEventListener('click', function () {
            navPanel.classList.toggle('open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let heroIndex = 0;
    let heroTimer = null;

    function showHero(index) {
        if (!slides.length) {
            return;
        }

        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, current) {
            slide.classList.toggle('active', current === heroIndex);
        });
        dots.forEach(function (dot, current) {
            dot.classList.toggle('active', current === heroIndex);
        });
    }

    function startHero() {
        if (slides.length < 2) {
            return;
        }

        heroTimer = window.setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            window.clearInterval(heroTimer);
            showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
            startHero();
        });
    });

    showHero(0);
    startHero();

    const keywordInput = document.querySelector('[data-filter-keyword]');
    const categorySelect = document.querySelector('[data-filter-category]');
    const yearSelect = document.querySelector('[data-filter-year]');
    const typeSelect = document.querySelector('[data-filter-type]');
    const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
    const emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        const keyword = normalize(keywordInput && keywordInput.value);
        const category = normalize(categorySelect && categorySelect.value);
        const year = normalize(yearSelect && yearSelect.value);
        const type = normalize(typeSelect && typeSelect.value);
        let visible = 0;

        cards.forEach(function (card) {
            const text = normalize(card.getAttribute('data-search'));
            const cardCategory = normalize(card.getAttribute('data-category'));
            const cardYear = normalize(card.getAttribute('data-year'));
            const cardType = normalize(card.getAttribute('data-type'));
            const matched = (!keyword || text.includes(keyword))
                && (!category || cardCategory === category)
                && (!year || cardYear === year)
                && (!type || cardType === type);

            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    if (keywordInput || categorySelect || yearSelect || typeSelect) {
        const params = new URLSearchParams(window.location.search);
        const initialKeyword = params.get('q');
        if (keywordInput && initialKeyword) {
            keywordInput.value = initialKeyword;
        }
        [keywordInput, categorySelect, yearSelect, typeSelect].forEach(function (field) {
            if (field) {
                field.addEventListener('input', applyFilters);
                field.addEventListener('change', applyFilters);
            }
        });
        applyFilters();
    }
})();
