import { H as Hls } from './hls-vendor.js';

const shell = document.querySelector('[data-player]');
const video = document.querySelector('[data-video]');
const startButton = document.querySelector('[data-video-start]');
const statusText = document.querySelector('[data-player-status]');

function setStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

function playSource() {
  if (!shell || !video) {
    return;
  }

  const source = shell.dataset.source;
  if (!source) {
    setStatus('暂未配置播放源。');
    return;
  }

  if (startButton) {
    startButton.classList.add('is-hidden');
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.play().catch(function () {
      setStatus('浏览器已加载播放源，请点击视频控件开始播放。');
    });
    setStatus('已使用浏览器原生 HLS 播放。');
    return;
  }

  if (Hls && Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      video.play().catch(function () {
        setStatus('播放源已就绪，请点击视频控件开始播放。');
      });
      setStatus('HLS 播放源已加载。');
    });

    hls.on(Hls.Events.ERROR, function (_event, data) {
      if (!data || !data.fatal) {
        return;
      }
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
        setStatus('网络中断后正在尝试重新加载。');
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
        setStatus('媒体错误后正在尝试恢复。');
      } else {
        hls.destroy();
        setStatus('当前浏览器无法播放该 HLS 源。');
      }
    });
    return;
  }

  setStatus('当前浏览器不支持 HLS 播放。');
}

if (startButton) {
  startButton.addEventListener('click', playSource);
}
