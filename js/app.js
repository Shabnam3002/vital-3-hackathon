/* ════════════════════════════════════════════
   APP — global state & track switching
   duo-diagnose / CODE:VITAL 2026
════════════════════════════════════════════ */

let activeTrack     = 'medicine';
let captureRunning  = false;
let captureTimer    = null;
let selectedCrop    = null;
let analysisRunning = false;

/* ── Track switching ──────────────────────── */
function switchTrack(track) {
  activeTrack = track;

  document.getElementById('view-med').classList.toggle('hidden', track !== 'medicine');
  document.getElementById('view-agri').classList.toggle('hidden', track !== 'agriculture');

  document.getElementById('nav-med').className  = 'nav-btn' + (track === 'medicine'    ? ' active-med'  : '');
  document.getElementById('nav-agri').className = 'nav-btn' + (track === 'agriculture' ? ' active-agri' : '');

}

/* ── Expander toggle ──────────────────────── */
function toggleExp(id) {
  const el   = document.getElementById(id);
  const body = el.querySelector('.expander-body');
  const open = el.classList.toggle('open');
  body.style.display = open ? 'block' : 'none';
}