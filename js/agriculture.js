/* ════════════════════════════════════════════
   AGRICULTURE — upload, samples, analysis, results
   duo-diagnose / CODE:VITAL 2026
════════════════════════════════════════════ */

/* ── File upload ──────────────────────────── */
function triggerFileSelect() {
  if (selectedCrop) return;
  document.getElementById('file-input').click();
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    alert('File exceeds 10 MB. Please upload a smaller image.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = document.getElementById('leaf-img');
    img.src = e.target.result;
    img.style.display = 'block';
    document.getElementById('up-icon').style.display  = 'none';
    document.getElementById('up-title').style.display = 'none';
    document.getElementById('up-sub').style.display   = 'none';
    document.getElementById('analyse-btn').disabled   = false;
    selectedCrop = 'tomato'; /* default classification for custom uploads */
    clearSampleSelection();
  };
  reader.readAsDataURL(file);
}

/* ── Sample selection ─────────────────────── */
function clearSampleSelection() {
  ['sc-tomato', 'sc-potato', 'sc-corn'].forEach(id => {
    document.getElementById(id).classList.remove('selected');
  });
}

function loadSample(type) {
  if (analysisRunning) return;
  clearSampleSelection();
  selectedCrop = type;

  document.getElementById('sc-' + type).classList.add('selected');

  const gradients = {
    tomato: 'linear-gradient(135deg,#1a4a1a 0%,#2d7a2d 40%,#a84a00 100%)',
    potato: 'linear-gradient(135deg,#0d2f0d 0%,#1f5c1f 45%,#1a2f08 100%)',
    corn:   'linear-gradient(135deg,#0a3d0a 0%,#1f7a1f 50%,#2a6a00 100%)',
  };
  const labels = {
    tomato: 'Tomato leaf · Early Blight sample',
    potato: 'Potato leaf · Late Blight sample',
    corn:   'Corn leaf · Healthy sample',
  };

  /* Reset preview */
  const img = document.getElementById('leaf-img');
  img.src = '';
  img.style.display = 'none';

  const uploader = document.getElementById('uploader');
  uploader.style.background = gradients[type];
  uploader.style.minHeight  = '160px';

  document.getElementById('up-icon').style.display  = 'none';
  document.getElementById('up-title').textContent   = labels[type];
  document.getElementById('up-title').style.display = 'block';
  document.getElementById('up-sub').style.display   = 'none';
  document.getElementById('analyse-btn').disabled   = false;

  /* Reset any previous results */
  document.getElementById('crop-predictions').classList.add('hidden');
  document.getElementById('agri-guide').classList.remove('hidden');
  document.getElementById('agri-results').classList.add('hidden');
  document.getElementById('agri-processing').classList.add('hidden');
}

/* ── Analysis pipeline ────────────────────── */
function startAnalysis() {
  if (analysisRunning || !selectedCrop) return;
  analysisRunning = true;

  document.getElementById('analyse-btn').disabled = true;
  document.getElementById('crop-predictions').classList.add('hidden');
  document.getElementById('agri-guide').classList.add('hidden');
  document.getElementById('agri-results').classList.add('hidden');

  const scanLine   = document.getElementById('scan-line');
  const processing = document.getElementById('agri-processing');
  scanLine.style.display = 'block';
  processing.classList.remove('hidden');

  let step = 0;
  const stepInterval = setInterval(() => {
    if (step < PROCESS_MSGS.length) {
      document.getElementById('ag-proc-msg').textContent = PROCESS_MSGS[step].msg;
      document.getElementById('ag-proc-sub').textContent = PROCESS_MSGS[step].sub;
      step++;
    }
  }, 400);

  setTimeout(() => {
    clearInterval(stepInterval);
    scanLine.style.display = 'none';
    processing.classList.add('hidden');
    showCropResults(selectedCrop);
    analysisRunning = false;
    document.getElementById('analyse-btn').disabled    = false;
    document.getElementById('analyse-btn').textContent = '🔍 Analyse Again';
  }, 2600);
}

/* ── Results display ──────────────────────── */
function showCropResults(type) {
  const data    = DISEASE_KB[type];
  const top     = data.predictions[0];
  const now     = new Date().toLocaleTimeString();
  const latency = Math.floor(700 + Math.random() * 300);

  /* Alert */
  document.getElementById('ag-alert-box').innerHTML =
    `<div class="alert ${data.alert.type}" style="margin-bottom:14px;">${data.alert.msg}</div>`;

  /* Prediction cards */
  const rankLabels = ['#1  Primary diagnosis', '#2  Alternative', '#3  Secondary'];
  const cardsHtml  = data.predictions.map((p, i) => {
    const pct    = Math.round(p.score * 100);
    const isTop  = i === 0;
    const barClr = isTop ? 'var(--green)' : 'var(--blue)';
    return `
      <div class="pred-card ${isTop ? 'top' : ''}">
        <div class="pred-eyebrow">${rankLabels[i]}</div>
        <div class="pred-name">${p.display_name}</div>
        <div class="bar-wrap" style="margin-bottom:10px;">
          <div class="bar-row">
            <span class="bar-lbl">Confidence</span>
            <span class="bar-pct">${pct}%</span>
          </div>
          <div class="bar-bg">
            <div class="bar-fill" style="width:${pct}%;background:${barClr};"></div>
          </div>
        </div>
        <div class="pred-detail"><strong>Condition:</strong> ${p.description}</div>
        <div class="pred-detail" style="margin-top:5px;"><strong>Action:</strong> ${p.action}</div>
      </div>`;
  }).join('');
  document.getElementById('pred-cards').innerHTML = cardsHtml;

  /* Metadata */
  document.getElementById('ag-latency').textContent     = latency + ' ms · ' + now;
  document.getElementById('ag-model-footer').textContent = 'model: ozair/plant-disease  ·  PlantVillage 38-class';

  /* Confidence bar in ctrl panel */
  const confPct = Math.round(top.score * 100);
  document.getElementById('ag-conf-pct').textContent  = confPct + '%';
  document.getElementById('ag-conf-fill').style.width = confPct + '%';

  /* Show panels */
  document.getElementById('agri-results').classList.remove('hidden');
  document.getElementById('crop-predictions').classList.remove('hidden');

  /* Sidebar update */
  const sbVal = document.getElementById('sb-crop-val');
  sbVal.textContent = top.display_name + ' (' + now.slice(0, 5) + ')';
  sbVal.classList.remove('muted');
}

/* ── Reset ────────────────────────────────── */
function resetCrop() {
  selectedCrop    = null;
  analysisRunning = false;

  document.getElementById('crop-predictions').classList.add('hidden');
  document.getElementById('agri-guide').classList.remove('hidden');
  document.getElementById('agri-results').classList.add('hidden');
  document.getElementById('agri-processing').classList.add('hidden');
  document.getElementById('scan-line').style.display = 'none';
  document.getElementById('analyse-btn').disabled    = true;
  document.getElementById('analyse-btn').innerHTML   = '🔍 &nbsp;Analyse Crop Health';

  const uploader = document.getElementById('uploader');
  uploader.style.background = '';
  uploader.style.minHeight  = '';

  document.getElementById('leaf-img').style.display  = 'none';
  document.getElementById('up-icon').style.display   = 'block';
  document.getElementById('up-title').textContent    = 'Drop leaf photo here';
  document.getElementById('up-title').style.display  = 'block';
  document.getElementById('up-sub').style.display    = 'block';

  clearSampleSelection();
}