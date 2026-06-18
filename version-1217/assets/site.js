(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero-carousel]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
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
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var input = panel.querySelector("[data-filter-search]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var empty = scope.querySelector("[data-empty-state]");

            function value(node) {
                return node ? node.value.trim().toLowerCase() : "";
            }

            function apply() {
                var keyword = value(input);
                var yearValue = value(year);
                var typeValue = value(type);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-category"),
                        card.textContent
                    ].join(" ").toLowerCase();
                    var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
                    var cardType = (card.getAttribute("data-type") || "").toLowerCase();
                    var matched = (!keyword || text.indexOf(keyword) !== -1) &&
                        (!yearValue || cardYear === yearValue) &&
                        (!typeValue || cardType === typeValue);
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, year, type].forEach(function (node) {
                if (node) {
                    node.addEventListener("input", apply);
                    node.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    function setupPlayer() {
        var video = document.querySelector("[data-video-url]");
        if (!video) {
            return;
        }
        var trigger = document.querySelector("[data-player-trigger]");
        var streamUrl = video.getAttribute("data-video-url");
        var attached = false;
        var hlsInstance = null;

        function attachStream() {
            if (attached || !streamUrl) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = streamUrl;
        }

        function begin() {
            attachStream();
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener("click", begin);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener("play", function () {
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
        attachStream();
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayer();
    });
}());
