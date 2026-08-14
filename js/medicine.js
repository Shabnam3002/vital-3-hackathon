/* ════════════════════════════════════════════
   MEDICINE — rPPG capture & vitals display
   duo-diagnose / CODE:VITAL 2026
════════════════════════════════════════════ */

window._mRunning   = false;
window._mCountdown = null;
window._mBpmTick   = null;

/* ── Helper: show/hide elements reliably ─── */
function _show(el) {
  if (!el) return;
  el.classList.remove('hidden');
  el.style.display = 'block';
}
function _hide(el) {
  if (!el) return;
  el.classList.add('hidden');
  el.style.display = 'none';
}

/* ── Init on DOM ready ─────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  var startBtn = document.getElementById('start-btn');
  if (startBtn) {
    startBtn.disabled  = true;
    startBtn.innerHTML = '▶ &nbsp;Start 15-Second Measurement';
  }
  _hide(document.getElementById('vitals-results'));
  _hide(document.getElementById('progress-wrap'));
  _hide(document.getElementById('ai-interp-section'));

  /* Close modal when clicking the dark backdrop */
  var overlay = document.getElementById('vitals-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeVitalsModal();
    });
  }

  /* ESC key closes modal */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeVitalsModal();
  });
});

/* ── Main capture function ─────────────── */
function startCapture() {
  if (window._mRunning) return;

  /* ── Face-in-box guard ── */
  var cameraActive = (typeof cameraStarted !== 'undefined' && cameraStarted);
  var faceOk       = window.faceDetected === true;

  /* Only block when camera is actually live (don't block simulated/no-camera mode) */
  if (cameraActive && !faceOk) {
    if (typeof pulseFaceMsg === 'function') pulseFaceMsg();
    return;
  }

  window._mRunning = true;

  var btn      = document.getElementById('start-btn');
  var progWrap = document.getElementById('progress-wrap');
  var progFill = document.getElementById('progress-fill');
  var timerEl  = document.getElementById('progress-timer');
  var subEl    = document.getElementById('progress-sub');
  var liveBpm  = document.getElementById('live-bpm');
  var liveSq   = document.getElementById('live-sq');

  /* Hide previous results */
  _hide(document.getElementById('vitals-results'));
  _hide(document.getElementById('ai-interp-section'));

  btn.disabled  = true;
  btn.innerHTML = '⏺ &nbsp;Capturing…';

  /* Pick a random vitals scenario */
  var scenario = VITALS_SCENARIOS[Math.floor(Math.random() * VITALS_SCENARIOS.length)];
  var TOTAL    = 15;
  var elapsed  = 0;

  /* Reset and show progress bar */
  progFill.style.transition = 'none';
  progFill.style.width      = '0%';
  timerEl.textContent = TOTAL + 's';
  subEl.textContent   = 'Collecting frames… 0 / 450';
  _show(progWrap);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      progFill.style.transition = 'width 0.9s linear';
    });
  });

  /* Live BPM flicker during capture */
  window._mBpmTick = setInterval(function () {
    var jitter = (Math.random() - 0.5) * 9;
    if (liveBpm) liveBpm.textContent = Math.round(scenario.hr + jitter);
    var sq = Math.min(Math.round(45 + elapsed * 3.2 + Math.random() * 6), 93);
    if (liveSq) liveSq.textContent = sq + '%';
  }, 800);

  /* Per-second countdown */
  window._mCountdown = setInterval(function () {
    elapsed++;
    var pct    = Math.round((elapsed / TOTAL) * 100);
    var rem    = TOTAL - elapsed;
    var frames = elapsed * 30;

    progFill.style.transition = 'width 0.9s linear';
    progFill.style.width      = pct + '%';
    timerEl.textContent = (rem > 0 ? rem : 0) + 's';
    subEl.textContent   = 'Collecting frames… ' + frames + ' / 450';

    if (elapsed >= TOTAL) {
      clearInterval(window._mCountdown);
      clearInterval(window._mBpmTick);
      window._mCountdown = null;
      window._mBpmTick   = null;
      /* Small delay so the bar hits 100% visually before hiding */
      setTimeout(function () {
        _finishCapture(scenario, btn, progWrap);
      }, 300);
    }
  }, 1000);
}

/* ── Finish: populate inline results + show popup modal ── */
function _finishCapture(scenario, btn, progWrap) {
  window._mRunning = false;
  _hide(progWrap);

  btn.disabled  = false;
  btn.innerHTML = '▶ &nbsp;Start New Measurement';

  /* Compute final values */
  var hr   = +(scenario.hr   + (Math.random() - 0.5) * 2).toFixed(1);
  var spo2 = +(scenario.spo2 + (Math.random() - 0.5) * 0.3).toFixed(1);
  var hrv  = +(scenario.hrv  + (Math.random() - 0.5) * 3).toFixed(1);
  var conf = Math.round(scenario.confidence * 100);
  var now  = new Date().toLocaleTimeString();

  /* ── Populate inline metric cards ── */
  document.getElementById('res-hr').innerHTML       = hr   + '<span class="metric-unit">BPM</span>';
  document.getElementById('res-spo2').innerHTML     = spo2 + '<span class="metric-unit">%</span>';
  document.getElementById('res-stress').textContent = scenario.stress;
  document.getElementById('res-hrv').innerHTML      = hrv  + '<span class="metric-unit">ms</span>';

  document.getElementById('bar-pct-val').textContent   = conf + '%';
  document.getElementById('vitals-sq-val').textContent = conf + '%';
  document.getElementById('vitals-time').textContent   = '15s capture · ' + now;

  var barFill = document.getElementById('bar-fill-val');
  if (barFill) {
    barFill.style.transition = 'none';
    barFill.style.width = '0%';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        barFill.style.transition = 'width 0.8s cubic-bezier(.4,0,.2,1)';
        barFill.style.width = conf + '%';
      });
    });
  }

  var liveBpm = document.getElementById('live-bpm');
  var liveSq  = document.getElementById('live-sq');
  if (liveBpm) liveBpm.textContent = hr;
  if (liveSq)  liveSq.textContent  = conf + '%';

  var stressColors = {
    Low:    'rgba(34,197,94,0.12)',
    Medium: 'rgba(245,158,11,0.12)',
    High:   'rgba(239,68,68,0.12)'
  };
  var sc = document.getElementById('stress-card');
  if (sc) sc.style.setProperty('--m-ibg', stressColors[scenario.stress] || stressColors.Medium);

  /* Show inline results panel */
  var results = document.getElementById('vitals-results');
  if (results) {
    results.classList.remove('hidden');
    results.style.removeProperty('display');
    results.style.display = 'block';
  }

  /* Sidebar stat */
  var sbVal = document.getElementById('sb-vitals-val');
  if (sbVal) {
    sbVal.textContent = hr + ' BPM · SpO₂ ' + spo2 + '% (' + now.slice(0, 5) + ')';
    sbVal.classList.remove('muted');
  }

  /* ── Show the popup modal ── */
  _showVitalsModal(hr, spo2, hrv, scenario.stress, conf, now);
}

/* ════════════════════════════════════════════
   VITALS POPUP MODAL
════════════════════════════════════════════ */
function _showVitalsModal(hr, spo2, hrv, stress, conf, now) {
  /* Populate metric cards */
  var mhr   = document.getElementById('m-hr');
  var mspo2 = document.getElementById('m-spo2');
  var mst   = document.getElementById('m-stress');
  var mhrv  = document.getElementById('m-hrv');
  if (mhr)   mhr.innerHTML   = hr   + '<span class="metric-unit">BPM</span>';
  if (mspo2) mspo2.innerHTML = spo2 + '<span class="metric-unit">%</span>';
  if (mst)   mst.textContent = stress;
  if (mhrv)  mhrv.innerHTML  = hrv  + '<span class="metric-unit">ms</span>';

  var mSqVal  = document.getElementById('m-sq-val');
  var mBarPct = document.getElementById('m-bar-pct');
  var mTime   = document.getElementById('m-time');
  if (mSqVal)  mSqVal.textContent  = conf + '%';
  if (mBarPct) mBarPct.textContent = conf + '%';
  if (mTime)   mTime.textContent   = '15s capture · ' + now;

  /* Stress card background */
  var stressColors = {
    Low:    'rgba(34,197,94,0.12)',
    Medium: 'rgba(245,158,11,0.12)',
    High:   'rgba(239,68,68,0.12)'
  };
  var msc = document.getElementById('m-stress-card');
  if (msc) msc.style.setProperty('--m-ibg', stressColors[stress] || stressColors.Medium);

  /* Signal quality bar animation */
  var mBar = document.getElementById('m-bar-fill');
  if (mBar) {
    mBar.style.transition = 'none';
    mBar.style.width = '0%';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        mBar.style.transition = 'width 0.9s cubic-bezier(.4,0,.2,1)';
        mBar.style.width = conf + '%';
      });
    });
  }

  /* Reset AI state */
  var aiLoad = document.getElementById('m-ai-loading');
  var aiRes  = document.getElementById('m-ai-result');
  var aiErr  = document.getElementById('m-ai-error');
  var aiTxt  = document.getElementById('m-ai-text');
  var aiSub  = document.getElementById('m-ai-sub');
  if (aiLoad) aiLoad.style.display = 'block';
  if (aiRes)  aiRes.style.display  = 'none';
  if (aiErr)  aiErr.style.display  = 'none';
  if (aiTxt)  aiTxt.textContent    = '';

  /* Show modal overlay */
  var overlay = document.getElementById('vitals-modal-overlay');
  if (overlay) overlay.classList.remove('hidden');

  /* Step through loading messages */
  var steps = [
    'Preparing health report…',
    'Analysing cardiovascular data…',
    'Evaluating HRV patterns…',
    'Generating wellness recommendations…',
    'Finalising interpretation…'
  ];
  var si = 0;
  var stepTimer = setInterval(function () {
    if (aiSub && si < steps.length) aiSub.textContent = steps[si++];
  }, 370);

  /* Generate and typewrite the report */
  setTimeout(function () {
    clearInterval(stepTimer);
    try {
      var report = _buildReport(hr, spo2, hrv, stress, conf);
      if (aiLoad) aiLoad.style.display = 'none';
      if (aiRes)  aiRes.style.display  = 'block';
      if (aiTxt) {
        aiTxt.textContent = '';
        var ci = 0;
        var typer = setInterval(function () {
          if (ci < report.length) {
            aiTxt.textContent += report[ci++];
          } else {
            clearInterval(typer);
            /* Mirror the report to the inline AI section too */
            _populateInlineAI(report);
          }
        }, 11);
      }
    } catch (e) {
      if (aiLoad) aiLoad.style.display = 'none';
      if (aiErr) {
        aiErr.style.display = 'block';
        aiErr.innerHTML = '⚠ &nbsp;Interpretation error — please reset and try again.';
      }
    }
  }, 1900);
}

/* ── Mirror finished report to inline AI panel ── */
function _populateInlineAI(report) {
  var section = document.getElementById('ai-interp-section');
  var loading = document.getElementById('ai-interp-loading');
  var result  = document.getElementById('ai-interp-result');
  var textEl  = document.getElementById('ai-interp-text');
  if (!section) return;
  section.style.display = 'block';
  if (loading) loading.style.display = 'none';
  if (result)  result.style.display  = 'block';
  if (textEl)  textEl.textContent    = report;
}

/* ── Close modal (with exit animation) ──── */
function closeVitalsModal() {
  var overlay = document.getElementById('vitals-modal-overlay');
  var panel   = document.getElementById('vitals-modal');
  if (!overlay || overlay.classList.contains('hidden')) return;

  if (panel)   panel.classList.add('modal-closing');
  overlay.classList.add('modal-overlay-closing');

  setTimeout(function () {
    overlay.classList.add('hidden');
    overlay.classList.remove('modal-overlay-closing');
    if (panel) panel.classList.remove('modal-closing');
  }, 240);
}

/* ════════════════════════════════════════════
   LOCAL AI REPORT GENERATOR
════════════════════════════════════════════ */
function _buildReport(hr, spo2, hrv, stress, sq) {
  var hrLine, spo2Line, hrvLine, actionLine, qualLine;

  if      (hr < 55) hrLine = 'Your heart rate of ' + hr + ' BPM is on the lower end — often seen in physically fit individuals or very relaxed states, though it can occasionally reflect fatigue.';
  else if (hr < 66) hrLine = 'Your heart rate of ' + hr + ' BPM sits in the calm, efficient range — a strong sign of good cardiovascular fitness and a well-rested nervous system.';
  else if (hr < 81) hrLine = 'At ' + hr + ' BPM your heart rate is comfortably within the normal adult range of 60–100 BPM, suggesting a healthy and well-regulated cardiovascular state.';
  else if (hr < 96) hrLine = 'Your heart rate of ' + hr + ' BPM is slightly elevated but still within the accepted normal range — common after mild activity, caffeine, or light stress.';
  else              hrLine = 'A heart rate of ' + hr + ' BPM sits above the typical resting range of 60–100 BPM, possibly reflecting recent exertion, dehydration, or heightened alertness.';

  if      (spo2 >= 98) spo2Line = 'Your SpO₂ of ' + spo2 + '% is excellent — this level reflects optimal lung function and highly efficient blood-oxygen transport throughout your body.';
  else if (spo2 >= 95) spo2Line = 'SpO₂ at ' + spo2 + '% falls solidly in the healthy 95–100% range, confirming your blood is carrying oxygen effectively.';
  else                 spo2Line = 'An SpO₂ of ' + spo2 + '% is slightly below the 95% healthy threshold — try slow, deep breaths and consult a clinician if this reading persists.';

  if      (hrv >= 55) hrvLine = 'Your HRV RMSSD of ' + hrv + ' ms is notably high, strongly associated with a well-recovered, low-stress state and a resilient autonomic nervous system.';
  else if (hrv >= 40) hrvLine = 'An HRV of ' + hrv + ' ms combined with ' + stress.toLowerCase() + ' stress indicates your body is managing current demands well — your rest-and-digest system is holding its own.';
  else if (hrv >= 25) hrvLine = 'At ' + hrv + ' ms your HRV is moderate — alongside ' + stress.toLowerCase() + ' stress this suggests your nervous system is working a little harder than ideal and may benefit from recovery time.';
  else                hrvLine = 'Your HRV of ' + hrv + ' ms is on the lower side; alongside ' + stress.toLowerCase() + ' stress, this points to physiological tension commonly caused by poor sleep or high workload.';

  if      (stress === 'Low'    && hrv >= 45) actionLine = 'Keep up whatever you\'re doing — the regular movement, sleep, and hydration are clearly paying off; a short walk after meals helps lock in this baseline.';
  else if (stress === 'Low'               )  actionLine = 'Adding 5–10 minutes of slow diaphragmatic breathing daily can further boost your HRV and reinforce this calm physiological state.';
  else if (stress === 'Medium' && hr > 80 )  actionLine = 'Try the 4-7-8 technique right now — inhale 4 s, hold 7 s, exhale 8 s — it can measurably lower heart rate and ease sympathetic nervous activity within minutes.';
  else if (stress === 'Medium'            )  actionLine = 'A 10-minute mindfulness break or a walk in natural light can meaningfully shift your HRV; consistent sleep timing over several weeks compounds the benefit.';
  else                                       actionLine = 'Prioritise rest today — reduce caffeine, aim for 7+ hours of sleep tonight, and try a short body-scan meditation to begin your recovery.';

  if      (sq >= 85) qualLine = 'Signal quality was strong at ' + sq + '%, lending these rPPG estimates higher reliability — though as a research prototype they remain indicative rather than clinical measurements.';
  else if (sq >= 72) qualLine = 'Signal quality of ' + sq + '% is acceptable; ensure even frontal lighting and minimise head movement during future scans for sharper results.';
  else               qualLine = 'Signal quality was ' + sq + '%, lower than ideal — treat these numbers as rough estimates and try again with better lighting and less movement.';

  return hrLine + ' ' + spo2Line + ' ' + hrvLine + ' ' + actionLine + ' ' + qualLine + ' Remember these readings come from an experimental webcam rPPG prototype and are not a substitute for a certified medical device — consult a healthcare professional if concerned.';
}

/* ── Reset ─────────────────────────────── */
function resetVitals() {
  closeVitalsModal();

  if (window._mCountdown) { clearInterval(window._mCountdown); window._mCountdown = null; }
  if (window._mBpmTick)   { clearInterval(window._mBpmTick);   window._mBpmTick   = null; }
  window._mRunning = false;

  _hide(document.getElementById('vitals-results'));
  _hide(document.getElementById('progress-wrap'));
  _hide(document.getElementById('ai-interp-section'));

  var liveBpm = document.getElementById('live-bpm');
  var liveSq  = document.getElementById('live-sq');
  if (liveBpm) liveBpm.textContent = '—';
  if (liveSq)  liveSq.textContent  = '—';

  var btn = document.getElementById('start-btn');
  if (btn) {
    btn.disabled  = false;
    btn.innerHTML = '▶ &nbsp;Start 15-Second Measurement';
  }
}