(function () {
  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.play-layer');
    var hlsInstance = null;
    var requested = false;

    if (!video || !button) {
      return;
    }

    function playVideo() {
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(function () {});
      }
    }

    function prepare() {
      var source = video.getAttribute('data-src');

      if (!source || video.getAttribute('data-ready') === '1') {
        return;
      }

      video.setAttribute('data-ready', '1');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requested) {
            playVideo();
          }
        });
        return;
      }

      video.src = source;
      video.load();
    }

    function start() {
      requested = true;
      prepare();
      player.classList.add('is-playing');
      playVideo();
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });
    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
