(function () {
    const activePlayers = new Map();

    function init(videoId, layerId, buttonId, streamUrl) {
        const video = document.getElementById(videoId);
        const layer = document.getElementById(layerId);
        const button = document.getElementById(buttonId);

        if (!video || !streamUrl) {
            return;
        }

        let ready = false;

        function attachStream() {
            if (ready) {
                return;
            }

            ready = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                activePlayers.set(videoId, hls);
                return;
            }

            video.src = streamUrl;
        }

        function playVideo(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }

            attachStream();
            video.setAttribute('controls', 'controls');

            if (layer) {
                layer.classList.add('is-hidden');
            }

            const result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    if (layer) {
                        layer.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (layer) {
            layer.addEventListener('click', playVideo);
            layer.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    playVideo(event);
                }
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener('play', function () {
            if (layer) {
                layer.classList.add('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (layer) {
                layer.classList.remove('is-hidden');
            }
        });
    }

    window.SitePlayer = {
        init: init,
        activePlayers: activePlayers
    };
})();
