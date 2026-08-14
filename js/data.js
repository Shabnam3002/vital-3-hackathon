/* ════════════════════════════════════════════
   DATA — static constants
   duo-diagnose / CODE:VITAL 2026
════════════════════════════════════════════ */

const VITALS_SCENARIOS = [
  { hr: 72, spo2: 98.1, hrv: 52, stress: 'Low',    confidence: 0.87 },
  { hr: 78, spo2: 97.4, hrv: 38, stress: 'Medium', confidence: 0.81 },
  { hr: 65, spo2: 98.8, hrv: 61, stress: 'Low',    confidence: 0.91 },
  { hr: 84, spo2: 96.9, hrv: 22, stress: 'Medium', confidence: 0.76 },
  { hr: 74, spo2: 97.7, hrv: 55, stress: 'Low',    confidence: 0.89 },
];

const DISEASE_KB = {
  tomato: {
    predictions: [
      {
        label:        'Tomato___Early_blight',
        score:        0.912,
        display_name: 'Tomato — Early Blight',
        description:  'Fungal infection caused by Alternaria solani. Produces dark concentric bull\'s-eye spots on mature leaves.',
        action:       'Remove affected leaves immediately. Apply copper-based fungicide every 7 days. Avoid overhead watering.'
      },
      {
        label:        'Tomato___Septoria_leaf_spot',
        score:        0.071,
        display_name: 'Tomato — Septoria Leaf Spot',
        description:  'Common fungal disease causing circular spots with dark borders and grey centres.',
        action:       'Apply copper fungicides. Avoid wet foliage. Rotate crops annually.'
      },
      {
        label:        'Tomato___Late_blight',
        score:        0.017,
        display_name: 'Tomato — Late Blight',
        description:  'Oomycete producing dark water-soaked leaf spots and white mould under humid conditions.',
        action:       'Destroy heavily infected plants. Apply chlorothalonil protective fungicide.'
      }
    ],
    alert: { type: 'success', msg: '✓ &nbsp;High confidence — <strong>91.2%</strong>' }
  },
  potato: {
    predictions: [
      {
        label:        'Potato___Late_blight',
        score:        0.878,
        display_name: 'Potato — Late Blight',
        description:  'Phytophthora infestans causes dark water-soaked lesions with white fungal fuzz on leaf margins under humid weather.',
        action:       'Apply protectant fungicide (Mancozeb). Remove and bury heavily infected branches. Do not compost.'
      },
      {
        label:        'Potato___Early_blight',
        score:        0.096,
        display_name: 'Potato — Early Blight',
        description:  'Fungal disease causing target-like brown spots on older leaves.',
        action:       'Apply copper-based fungicides. Ensure proper nitrogen levels in soil.'
      },
      {
        label:        'Potato___healthy',
        score:        0.026,
        display_name: 'Potato — Healthy (unlikely)',
        description:  'Low probability of healthy classification given visible lesions.',
        action:       'Recheck with a clearer, closer image if uncertain.'
      }
    ],
    alert: { type: 'success', msg: '✓ &nbsp;High confidence — <strong>87.8%</strong>' }
  },
  corn: {
    predictions: [
      {
        label:        'Corn_(maize)___healthy',
        score:        0.965,
        display_name: 'Corn — Healthy',
        description:  'No disease detected. Normal chlorophyll distribution patterns present across the leaf surface.',
        action:       'No treatment necessary. Maintain standard fertiliser schedule and monitor regularly for insect pests.'
      },
      {
        label:        'Corn_(maize)___Common_rust_',
        score:        0.028,
        display_name: 'Corn — Common Rust',
        description:  'Fungal disease showing orange-brown powdery pustules on leaf surfaces.',
        action:       'Use resistant seed hybrids. Apply preventive strobilurin fungicides if rust detected.'
      },
      {
        label:        'Corn_(maize)___Northern_Leaf_Blight',
        score:        0.007,
        display_name: 'Corn — Northern Leaf Blight',
        description:  'Fungal disease causing long grey-green cigar-shaped lesions on leaves.',
        action:       'Plant resistant hybrids. Apply triazole fungicide at tasseling.'
      }
    ],
    alert: { type: 'success', msg: '✓ &nbsp;Very high confidence — <strong>96.5%</strong>' }
  }
};

const PROCESS_MSGS = [
  { msg: 'Initialising model…',      sub: 'Loading ResNet-50 weights' },
  { msg: 'Preprocessing image…',     sub: 'Resize to 224×224 · Normalise' },
  { msg: 'Running inference…',       sub: 'Forward pass through 50 layers' },
  { msg: 'Classifying 38 classes…', sub: 'PlantVillage dataset match' },
  { msg: 'Computing confidence…',   sub: 'Softmax output · Top-3 sort' },
  { msg: 'Enriching results…',      sub: 'Fetching disease knowledge base' },
];