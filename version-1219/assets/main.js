(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupImages() {
        document.querySelectorAll("img").forEach(function (img) {
            img.addEventListener("error", function () {
                img.classList.add("image-missing");
            }, { once: true });
        });
    }

    function setupMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var nav = document.querySelector(".site-nav");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            var open = nav.classList.toggle("is-open");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero-slider]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide-target")) || 0);
                play();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }

        show(0);
        play();
    }

    function setupFilters() {
        document.querySelectorAll(".site-filter").forEach(function (panel) {
            var scope = panel.closest("section") || document;
            var list = scope.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
            var keywordInput = panel.querySelector("[data-filter-keyword]");
            var categorySelect = panel.querySelector("[data-filter-category]");
            var yearSelect = panel.querySelector("[data-filter-year]");

            function apply() {
                var keyword = normalize(keywordInput && keywordInput.value);
                var category = normalize(categorySelect && categorySelect.value);
                var year = normalize(yearSelect && yearSelect.value);
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-year")
                    ].join(" "));
                    var cardCategory = normalize(card.getAttribute("data-category"));
                    var cardYear = normalize(card.getAttribute("data-year"));
                    var visible = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        visible = false;
                    }
                    if (category && cardCategory !== category) {
                        visible = false;
                    }
                    if (year && cardYear !== year) {
                        visible = false;
                    }
                    card.classList.toggle("is-filter-hidden", !visible);
                });
            }

            [keywordInput, categorySelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function setupGlobalSearch() {
        var input = document.getElementById("globalSearchInput");
        var button = document.getElementById("globalSearchButton");
        var results = document.getElementById("globalSearchResults");
        if (!input || !button || !results || !Array.isArray(window.MOVIE_INDEX)) {
            return;
        }

        function render(items) {
            results.innerHTML = items.slice(0, 120).map(function (movie) {
                var tags = movie.tags.slice(0, 4).map(function (tag) {
                    return "<span>" + escapeHtml(tag) + "</span>";
                }).join("");
                return "<article class=\"movie-card\">" +
                    "<a class=\"poster-link\" href=\"./" + movie.file + "\">" +
                    "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                    "<span class=\"poster-gradient\"></span>" +
                    "<span class=\"poster-type\">" + escapeHtml(movie.type) + "</span>" +
                    "<span class=\"poster-score\">" + movie.rating + "</span>" +
                    "</a>" +
                    "<div class=\"movie-card-body\">" +
                    "<a class=\"movie-card-title\" href=\"./" + movie.file + "\">" + escapeHtml(movie.title) + "</a>" +
                    "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                    "<div class=\"meta-row\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>" +
                    "<div class=\"tag-row\">" + tags + "</div>" +
                    "</div>" +
                    "</article>";
            }).join("");
            setupImages();
        }

        function escapeHtml(value) {
            return String(value || "").replace(/[&<>\"]/g, function (char) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;"
                }[char];
            });
        }

        function search() {
            var keyword = normalize(input.value);
            if (!keyword) {
                render(window.MOVIE_INDEX.slice(0, 64));
                return;
            }
            var matched = window.MOVIE_INDEX.filter(function (movie) {
                return normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.category,
                    movie.tags.join(" ")
                ].join(" ")).indexOf(keyword) !== -1;
            });
            render(matched);
        }

        input.addEventListener("input", search);
        button.addEventListener("click", search);
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playOverlay");
        if (!video || !overlay || !sourceUrl) {
            return;
        }
        var hlsInstance = null;
        var mediaReady = false;

        function playVideo() {
            overlay.classList.add("is-hidden");
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        function attach() {
            if (mediaReady) {
                playVideo();
                return;
            }
            mediaReady = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                playVideo();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ autoStartLoad: true });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                return;
            }
            video.src = sourceUrl;
            video.load();
            playVideo();
        }

        overlay.addEventListener("click", attach);
        video.addEventListener("click", function () {
            if (video.paused) {
                attach();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupImages();
        setupMenu();
        setupHero();
        setupFilters();
        setupGlobalSearch();
    });
})();
