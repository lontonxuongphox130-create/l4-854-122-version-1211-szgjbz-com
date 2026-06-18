
(function () {
  var root = document.querySelector('[data-player]');
  if (!root) {
    return;
  }

  var video = root.querySelector('video');
  var button = root.querySelector('.play-layer');
  var stream = root.getAttribute('data-play');
  var ready = false;
  var hls = null;

  function attach() {
    if (ready || !video || !stream) {
      return;
    }
    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  }

  function start() {
    attach();
    if (button) {
      button.classList.add('is-hidden');
    }
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!ready || video.paused) {
        start();
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
})();
