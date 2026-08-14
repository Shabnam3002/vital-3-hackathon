/* ════════════════════════════════════════════
   CAMERA — real webcam via getUserMedia
   duo-diagnose / CODE:VITAL 2026
════════════════════════════════════════════ */

let stream         = null;
let cameraStarted  = false;
let cameraStarting = false;

/* ── Global face-in-box state (read by medicine.js) ── */
window.faceDetected = false;

/* ── Waveform bars ─────────────────────────── */
function buildWaveform() {
  const container = document.getElementById('cam-wave-bars');
  if (!container) return;
  container.innerHTML = '';
  const heights = [3, 6, 4, 10, 5, 3, 7, 12, 5, 3, 6, 4, 9, 5, 3, 8, 11, 5, 3, 6, 4, 10, 5, 3, 7];
  heights.forEach((h, i) => {
    const bar = document.createElement('div');
    bar.className = 'cam-wave-bar';
    bar.style.height = h + 'px';
    bar.style.animationDelay = (i * 0.055) + 's';
    container.appendChild(bar);
  });
}

/* ── Badge helpers ─────────────────────────── */
function setBadge(id, dotClass, text) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = `<span class="badge-dot ${dotClass}"></span>${text}`;
}

function setStatusBar(state) {
  const dot   = document.querySelector('.sb-ok-dot');
  const right = document.querySelector('.sb-right');
  if (state === 'active') {
    if (dot)   dot.style.background = 'var(--green)';
    if (right) right.textContent = 'CAMERA LIVE';
  } else if (state === 'error') {
    if (dot)   dot.style.background = 'var(--red, #ef4444)';
    if (right) right.textContent = 'CAMERA ERROR';
  } else {
    if (dot)   dot.style.background = 'var(--green)';
    if (right) right.textContent = 'ENGINE READY';
  }
}

/* ── Start webcam ──────────────────────────── */
async function startCamera() {
  if (cameraStarted || cameraStarting) return;
  cameraStarting = true;

  const video       = document.getElementById('cam-video');
  const placeholder = document.getElementById('cam-placeholder');
  const camFace     = document.querySelector('.cam-face');
  const viewport    = document.querySelector('.cam-viewport');

  if (!video || !viewport) { cameraStarting = false; return; }

  setBadge('camera-badge', 'y', 'Camera: Starting…');

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
      audio: false
    });

    video.srcObject = stream;

    /* Fully constrain video INSIDE .cam-viewport before showing it */
    video.style.cssText = `
      display: block;
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scaleX(-1);
      z-index: 2;
    `;

    /* play() is a Promise — catch rejections without aborting */
    try { await video.play(); } catch (e) { console.warn('video.play():', e); }

    cameraStarted  = true;
    cameraStarting = false;

    /* Hide placeholder layers */
    if (placeholder) placeholder.style.display = 'none';
    if (camFace)     camFace.style.display      = 'none';

    setBadge('camera-badge', 'g', 'Camera: Active');
    setStatusBar('active');

    /* Reveal bbox/ROI immediately in the "not detected" (red) state */
    const bbox = document.querySelector('.cam-bbox-overlay');
    const roi  = document.querySelector('.cam-roi-overlay');
    if (bbox) { bbox.style.zIndex = '3'; bbox.style.display = 'block'; }
    if (roi)  { roi.style.zIndex  = '3'; roi.style.display  = 'block'; }
    updateFaceDetectionUI(false);
    _ensureFaceModel(); /* safety net in case DOMContentLoaded preload hasn't finished/started */

    /* Give the stream a moment to produce real frames, then start
       real-time presence sampling from the actual video feed        */
    setTimeout(() => {
      checkFacePresence();
      window._faceCheckInterval = setInterval(checkFacePresence, 500);
    }, 500);

  } catch (err) {
    cameraStarting = false;
    console.warn('Camera access denied or unavailable:', err);
    handleCameraError(err, placeholder, camFace);
  }
}

/* ════════════════════════════════════════════
   FACE-IN-BOX DETECTION
   Primary: face-api.js TinyFaceDetector — a real,
   lightweight in-browser face detector (~190KB model),
   loaded from a public CDN. Only reports "detected"
   when an actual face is centred inside the guide box.
   Fallback: skin-tone heuristic, used only if the
   detector library/model fails to load (e.g. offline).
════════════════════════════════════════════ */

/* Fractional guide-box region — must match .cam-bbox-overlay's inline style */
const FACE_BOX = { x: 0.22, y: 0.10, w: 0.56, h: 0.78 };

const FACE_MODEL_URL   = 'https://justadudewhohacks.github.io/face-api.js/models';
let _faceModelReady     = false;
let _faceModelLoading   = false;
let _faceCheckBusy      = false;

/* Preload the detector model as early as possible (called on DOMContentLoaded
   and again, harmlessly, when the camera starts) so it's usually ready before
   the user's face ever hits the box. */
async function _ensureFaceModel() {
  if (_faceModelReady || _faceModelLoading) return;
  if (typeof faceapi === 'undefined') return; /* library script didn't load — heuristic fallback will be used */
  _faceModelLoading = true;
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL);
    _faceModelReady = true;
  } catch (e) {
    console.warn('Face detector model failed to load — falling back to heuristic detection:', e);
  } finally {
    _faceModelLoading = false;
  }
}

/* True if the detected face's centre point falls inside the guide box.
   Coordinates are in raw video pixel space (unmirrored), which matches
   FACE_BOX since it's horizontally symmetric around the frame's centre. */
function _isFaceInsideGuideBox(box, vw, vh) {
  const gx = vw * FACE_BOX.x, gy = vh * FACE_BOX.y;
  const gw = vw * FACE_BOX.w, gh = vh * FACE_BOX.h;
  const cx = box.x + box.width  / 2;
  const cy = box.y + box.height / 2;
  return cx >= gx && cx <= gx + gw && cy >= gy && cy <= gy + gh;
}

/* ── Fallback heuristic (only used if face-api.js is unavailable) ── */
let _faceSampleCanvas = null;

function _sampleFaceRegion() {
  const video = document.getElementById('cam-video');
  if (!video || !video.videoWidth) return null;

  const vw = video.videoWidth, vh = video.videoHeight;
  const sx = vw * FACE_BOX.x, sy = vh * FACE_BOX.y, sw = vw * FACE_BOX.w, sh = vh * FACE_BOX.h;

  const SAMPLE_W = 32, SAMPLE_H = 32;
  if (!_faceSampleCanvas) _faceSampleCanvas = document.createElement('canvas');
  _faceSampleCanvas.width  = SAMPLE_W;
  _faceSampleCanvas.height = SAMPLE_H;

  const ctx = _faceSampleCanvas.getContext('2d', { willReadFrequently: true });
  try {
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, SAMPLE_W, SAMPLE_H);
    const { data } = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
    let skin = 0, total = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      total++;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      if (r > 90 && g > 40 && b > 20 && (max - min) > 12 && Math.abs(r - g) > 12 && r > g && r > b) {
        skin++;
      }
    }
    return total ? skin / total : 0;
  } catch (e) {
    return null; /* frame not ready/readable yet */
  }
}

/* ── Main check, called on an interval while the camera is live ── */
async function checkFacePresence() {
  if (_faceCheckBusy) return; /* skip if a previous async check is still running */
  _faceCheckBusy = true;

  try {
    const video = document.getElementById('cam-video');
    if (!video || !video.videoWidth) return;

    /* Primary path: real face detector */
    if (typeof faceapi !== 'undefined' && _faceModelReady) {
      const result = await faceapi.detectSingleFace(
        video,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
      );
      const inBox = result ? _isFaceInsideGuideBox(result.box, video.videoWidth, video.videoHeight) : false;
      updateFaceDetectionUI(inBox);
      return;
    }

    /* Fallback path: skin-tone heuristic (model still loading, or unavailable) */
    const ratio = _sampleFaceRegion();
    if (ratio === null) return;
    const ON_THRESHOLD  = 0.16; /* raised to reduce false-positives from warm-toned backgrounds */
    const OFF_THRESHOLD = 0.08;
    if (window.faceDetected) {
      if (ratio < OFF_THRESHOLD) updateFaceDetectionUI(false);
    } else {
      if (ratio > ON_THRESHOLD) updateFaceDetectionUI(true);
    }
  } catch (e) {
    console.warn('Face check error:', e);
  } finally {
    _faceCheckBusy = false;
  }
}

/* ── Update bbox colour + persistent on-screen message ── */
function updateFaceDetectionUI(detected) {
  window.faceDetected = detected;

  const bbox = document.querySelector('.cam-bbox-overlay');
  const roi  = document.querySelector('.cam-roi-overlay');
  const msg  = document.getElementById('cam-face-msg');

  if (bbox) { bbox.classList.toggle('face-ok', detected); bbox.classList.toggle('face-bad', !detected); }
  if (roi)  { roi.classList.toggle('face-ok', detected);  roi.classList.toggle('face-bad', !detected); }
  if (msg)  { msg.classList.toggle('show', !detected); }

  setBadge('face-badge', detected ? 'g' : 'r', detected ? 'Face: Detected' : 'Face: Not found');
}

/* ── Pulse the message + shake the button when a measurement is blocked ── */
function pulseFaceMsg() {
  const msg = document.getElementById('cam-face-msg');
  if (msg) {
    msg.classList.remove('pulse');
    void msg.offsetWidth; /* restart animation */
    msg.classList.add('pulse');
  }
  const btn = document.getElementById('start-btn');
  if (btn) {
    btn.classList.add('btn-shake');
    setTimeout(() => btn.classList.remove('btn-shake'), 500);
  }
}

/* ── Error fallback ────────────────────────── */
function handleCameraError(err, placeholder, camFace) {
  if (placeholder) placeholder.style.display = 'block';
  if (camFace)     camFace.style.display = 'flex';

  setBadge('camera-badge', 'y', 'Camera: No access');
  setBadge('face-badge',   'n', 'Simulated mode');
  setStatusBar('error');

  const notice = document.getElementById('cam-error-notice');
  if (notice) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      notice.textContent = '📷 Camera permission denied — running in simulated mode';
    } else if (err.name === 'NotFoundError') {
      notice.textContent = '📷 No camera found — running in simulated mode';
    } else {
      notice.textContent = '📷 Camera unavailable — running in simulated mode';
    }
    notice.style.display = 'block';
  }
}

/* ── Stop webcam + reset viewport to idle ──── */
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  cameraStarted  = false;
  cameraStarting = false;

  const video       = document.getElementById('cam-video');
  const placeholder = document.getElementById('cam-placeholder');
  const camFace     = document.querySelector('.cam-face');
  const bbox        = document.querySelector('.cam-bbox-overlay');
  const roi         = document.querySelector('.cam-roi-overlay');
  const notice      = document.getElementById('cam-error-notice');

  window.faceDetected = false;
  if (window._faceCheckInterval) { clearInterval(window._faceCheckInterval); window._faceCheckInterval = null; }

  if (video)       { video.srcObject = null; video.style.cssText = 'display:none;'; }
  if (placeholder) placeholder.style.display = 'block';
  if (camFace)     camFace.style.display = 'flex';
  if (bbox)        { bbox.style.display = 'none'; bbox.classList.remove('face-ok', 'face-bad'); }
  if (roi)         { roi.style.display  = 'none'; roi.classList.remove('face-ok', 'face-bad'); }
  if (notice)      notice.style.display = 'none';

  const faceMsg = document.getElementById('cam-face-msg');
  if (faceMsg) faceMsg.classList.remove('show', 'pulse');

  setBadge('camera-badge', 'y', 'Camera: Ready');
  setBadge('face-badge',   'y', 'Detecting…');
  setStatusBar('ready');
}

/* ── Enable-camera button handler ─────────── */
async function handleEnableCamera() {
  const enableBtn = document.getElementById('enable-cam-btn');
  const startBtn  = document.getElementById('start-btn');
  if (cameraStarted) return;

  enableBtn.disabled  = true;
  enableBtn.innerHTML = '⏳ &nbsp;Requesting access…';

  await startCamera();

  if (cameraStarted) {
    enableBtn.innerHTML        = '✅ &nbsp;Camera Active';
    enableBtn.style.background = 'rgba(34,197,94,0.10)';
    enableBtn.style.border     = '1px solid rgba(34,197,94,0.3)';
    enableBtn.style.color      = '#4ade80';
    enableBtn.style.cursor     = 'default';
    if (startBtn) startBtn.disabled = false;
  } else {
    enableBtn.disabled  = false;
    enableBtn.innerHTML = '📷 &nbsp;Retry Camera';
  }
}

/* ── Init on DOM ready ─────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildWaveform();
  _ensureFaceModel(); /* start loading the face detector in the background */
  /* Camera only starts when user clicks Enable Camera */
});

window.addEventListener('beforeunload', stopCamera);