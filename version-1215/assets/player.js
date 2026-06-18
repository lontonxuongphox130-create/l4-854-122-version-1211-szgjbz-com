(function () {
  var hlsScript = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
  var hlsReady = null;

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsReady) {
      return hlsReady;
    }

    hlsReady = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = hlsScript;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

    return hlsReady;
  }

  function bindPlayer(shell) {
    var video = shell.querySelector('video');
    var layer = shell.querySelector('.play-layer');
    var streamUrl = shell.getAttribute('data-play');
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function showVideo() {
      if (layer) {
        layer.classList.add('is-hidden');
      }
    }

    function begin() {
      showVideo();

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', streamUrl);
        }

        video.play().catch(function () {});
        return;
      }

      loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          if (!attached) {
            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            attached = true;
          }

          video.play().catch(function () {});
        } else {
          if (!video.getAttribute('src')) {
            video.setAttribute('src', streamUrl);
          }

          video.play().catch(function () {});
        }
      }).catch(function () {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', streamUrl);
        }

        video.play().catch(function () {});
      });
    }

    if (layer) {
      layer.addEventListener('click', begin);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.player-shell')).forEach(bindPlayer);
})();
