(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");

        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupCarousel() {
        var carousel = document.querySelector("[data-carousel]");

        if (!carousel) {
            return;
        }

        var slides = selectAll("[data-carousel-slide]", carousel);
        var dots = selectAll("[data-carousel-dot]", carousel);
        var previous = carousel.querySelector("[data-carousel-prev]");
        var next = carousel.querySelector("[data-carousel-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-carousel-dot")) || 0);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        selectAll("[data-filter-panel]").forEach(function (panel) {
            var root = panel.parentElement;
            var input = panel.querySelector("[data-filter-input]");
            var buttons = selectAll("[data-filter-value]", panel);
            var cards = selectAll("[data-filter-card]", root);
            var current = "all";

            function filterCards() {
                var query = input ? input.value.trim().toLowerCase() : "";

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-category"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesButton = current === "all" || text.indexOf(current.toLowerCase()) !== -1;
                    card.classList.toggle("is-hidden-card", !(matchesQuery && matchesButton));
                });
            }

            if (input) {
                input.addEventListener("input", filterCards);
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    current = button.getAttribute("data-filter-value") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    filterCards();
                });
            });
        });
    }

    function movieCard(movie) {
        var safeTitle = escapeHtml(movie.title);
        var safeText = escapeHtml(movie.text);
        var safeMeta = escapeHtml(movie.year + " · " + movie.region + " · " + movie.type);
        return "" +
            "<a class=\"movie-card\" href=\"./" + movie.file + "\">" +
                "<span class=\"poster-frame\">" +
                    "<img src=\"" + movie.cover + "\" alt=\"" + safeTitle + "\" loading=\"lazy\">" +
                    "<span class=\"category-badge\">" + escapeHtml(movie.category) + "</span>" +
                    "<span class=\"duration-badge\">" + escapeHtml(movie.duration) + "</span>" +
                    "<span class=\"play-hover\">▶</span>" +
                "</span>" +
                "<span class=\"movie-card-body\">" +
                    "<strong>" + safeTitle + "</strong>" +
                    "<em>" + safeText + "</em>" +
                    "<span class=\"movie-meta\">" + safeMeta + "</span>" +
                    "<span class=\"movie-score\">★ " + movie.rating + " · " + movie.views + " 热度</span>" +
                "</span>" +
            "</a>";
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var page = document.querySelector("[data-search-page]");

        if (!page || !window.MOVIE_INDEX) {
            return;
        }

        var input = page.querySelector("[data-search-input]");
        var button = page.querySelector("[data-search-button]");
        var results = page.querySelector("[data-search-results]");
        var suggestions = selectAll("[data-search-suggestion]", page);

        function render() {
            var query = input.value.trim().toLowerCase();
            var list = window.MOVIE_INDEX.filter(function (movie) {
                if (!query) {
                    return movie.featured;
                }
                return movie.search.indexOf(query) !== -1;
            }).slice(0, 96);

            if (!list.length) {
                results.innerHTML = "<div class=\"content-card\"><h2>暂无匹配影片</h2><p>可以尝试输入片名、年份、地区或类型关键词。</p></div>";
                return;
            }

            results.innerHTML = list.map(movieCard).join("");
        }

        if (input) {
            input.addEventListener("input", render);
        }

        if (button) {
            button.addEventListener("click", render);
        }

        suggestions.forEach(function (item) {
            item.addEventListener("click", function () {
                input.value = item.getAttribute("data-search-suggestion") || "";
                render();
            });
        });

        render();
    }

    window.initMoviePlayer = function (videoUrl) {
        var video = document.getElementById("movieVideo");
        var overlay = document.getElementById("playOverlay");
        var attached = false;
        var hlsInstance = null;

        if (!video || !overlay || !videoUrl) {
            return;
        }

        function attachVideo() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoUrl;
            }
        }

        function playVideo() {
            attachVideo();
            overlay.classList.add("is-hidden");
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        overlay.addEventListener("click", playVideo);

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener("play", function () {
            overlay.classList.add("is-hidden");
        });

        video.addEventListener("ended", function () {
            overlay.classList.remove("is-hidden");
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupCarousel();
        setupFilters();
        setupSearchPage();
    });
})();
