<h2 align="center"> VITAL 3 (2026 Hackathon Winner)</h2>
<h2 align="center"> Dual-Track Diagnostics</h2>
<p align="center">
<img src="https://skillicons.dev/icons?i=js,html,css,python"/>
</p>
Diagnostics in human medicine and crop science share a fundamental bottleneck: early-stage detection requires specialized, expensive hardware.

**For Humans:** Traditional clinical monitoring requires pulse oximeters, ECGs, and chest straps.

**For Crops:** Agronomists rely on laboratory tissue sampling or expensive field spectrometers to identify diseases.

**Duo-Diagnose solves both problems with a standard camera.** By applying advanced computer vision—**Remote Photoplethysmography (rPPG)** on skin pixels and **ResNet-50 Deep Convolutional Networks** on plant leaves—the platform performs high-accuracy real-time screening using consumer-grade webcams and smartphone cameras.


# 🩺 DUO-DIAGNOSE — AI Vitals & Crop Health Interface 🌾

[![Hackathon Win](https://img.shields.io/badge/Hackathon-Vital%203%20Winner-gold?style=for-the-badge&logo=github)](https://github.com/Shabnam3000/vital-3-hackathon)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Event](https://img.shields.io/badge/Event-CODE%3AVITAL%202026-brightgreen?style=for-the-badge)](https://github.com/Shabnam3000/vital-3-hackathon)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Python-orange?style=for-the-badge&logo=javascript)](https://github.com/Shabnam3000/vital-3-hackathon)

> **"Diagnostics for People and Plants—Powered by a Single Camera Feed."**
> An award-winning, state-of-the-art dual-track diagnostic platform developed for **CODE:VITAL 2026 (Vital 3 Hackathon)** representing **AKS University**.

---

## ⚡ Recruiter TL;DR (Quick Pitch)

**Duo-Diagnose** is a high-fidelity research prototype that replaces expensive medical and agricultural screening hardware with standard webcam feed and computer vision.

### 🌟 Why this project stands out:
1. **🏆 Winner of Vital 3 Hackathon (CODE:VITAL 2026)** out of numerous competitive entries.
2. **🤖 Contactless Health Tracking**: Extracts live heart rate, HRV, stress levels, and oxygen levels (`SpO₂`) directly from forehead and cheek blood-volume changes using just a laptop webcam (rPPG).
3. **🌾 Agri-Tech AI Integration**: Implements a deep-learning convolutional neural network pipeline using **ResNet-50** to analyze leaf structures and detect crop diseases instantly with tailor-made organic/chemical treatment advice.
4. **💡 Zero-Latency Local Architecture**: Features an offline-capable, highly-responsive frontend that performs face-tracking fallbacks and localized expert reasoning with zero external API dependencies.

### 🛠️ Core Tech Stack & Toolkit

| Layer | Technologies & Frameworks |
| :--- | :--- |
| **Frontend UI/UX** | HTML5, CSS3 Grid/Flexbox, Custom Glassmorphic CSS Variables, Hardware-Accelerated Keyframes |
| **Computer Vision (JS)** | `face-api.js` (Lightweight TinyFaceDetector neural network - ~190KB) |
| **Algorithms (JS)** | Custom RGB Skin-Tone Segmentation Heuristics (Offline webcam face fallback) |
| **Deep Learning (AI)** | **ResNet-50 Convolutional Neural Network** trained on the *PlantVillage* dataset (38 classes) |
| **Local Desktop App** | Python 3.12, OpenCV (FacePhys computer vision module), `run_pules.py` camera processor |

---

## 🏗️ System Architecture

```text
                  +----------------------------------------------+
                  |            DUO-DIAGNOSE INTERFACE            |
                  +-----------------------+----------------------+
                                          |
                     +--------------------+--------------------+
                     |                                         |
     [ TRACK 1: HUMAN VITALS (rPPG) ]          [ TRACK 2: CROP DISEASE (AI) ]
                     |                                         |
         +-----------v-----------+                 +-----------v-----------+
         |     Laptop Webcam     |                 |   Leaf Photo Upload   |
         +-----------+-----------+                 +-----------+-----------+
                     |                                         |
         +-----------v-----------+                 +-----------v-----------+
         | TinyFaceDetector (JS) |                 |   224x224 Normalize   |
         |  * Fallback: Custom   |                 +-----------+-----------+
         |    Skin-Tone Filter   |                             |
         +-----------+-----------+                 +-----------v-----------+
                     |                             | ResNet-50 CNN Engine  |
         +-----------v-----------+                 |  * PlantVillage DB    |
         | Raw Chrominance (rPPG)|                 +-----------+-----------+
         |  Red vs Blue Channel  |                             |
         +-----------+-----------+                 +-----------v-----------+
                     |                             | Top-3 Softmax Rank &  |
         +-----------v-----------+                 | Actionable Treatment  |
         | Local AI Report Engine|                 +-----------------------+
         | * Claude-style advice |
         | * 4-7-8 Breathing Rec |
         +-----------------------+
🛠️ Deep-Dive Architecture & Implementation (Click to Expand)
🔬 The Science of Remote Photoplethysmography (rPPG)
Traditional pulse oximeters clip to fingers to measure light absorption changes caused by blood volume pulses. Duo-Diagnose performs this completely touch-free.
When your heart beats, blood volume in facial capillaries fluctuates.
These microscopic changes modify how red and green light reflect off your skin.
By analyzing pixel color channel variances over a 15-second scan window, the algorithm extracts the pulse wave and calculates biometric data.
🚀 Dual-Layer Face Tracking Pipeline
To extract high-quality raw signals, the platform implements a robust tracking flow:
Primary Path: Uses face-api.js loaded with a ultra-lightweight TinyFaceDetector neural network model (~190KB) to draw a Region of Interest (ROI) over the forehead.
Secondary Fallback (Heuristic Skin Detection): To ensure offline resilience or execution when network CDNs are unavailable, we built a fallback skin color classifier. It samples RGB pixels dynamically using threshold thresholds: 
Skin Filter: R>90∧G>40∧B>20∧R>G∧R>B
 This prevents background noise or random objects from being captured as face signals.
📊 Localized Health Diagnostics & RMSSD Stress Engine
Instead of pinging a remote cloud server, we engineered a rules-based wellness interpreter that evaluates the user's vitals:
Heart Rate (BPM) from light absorption frequencies.
Oxygen Saturation (SpO 
2
​
 ) calculated via standard AC/DC color absorption ratio.
HRV RMSSD (ms): Computes the variation between consecutive intervals. If RMSSD is low (< 20ms), the system flags High Stress and automatically recommends clinical pacing exercises such as the 4-7-8 Breathing Technique.
🧠 Deep Learning Architecture
Our Agriculture Track protects regional food security by letting farmers identify crop diseases instantaneously using a phone photo.
Model Backbone: Features a deep ResNet-50 Residual Neural Network pre-trained on ImageNet and fine-tuned on the PlantVillage dataset (covering 38 distinct plant/disease pairings).
The "Skip Connections" Advantage: By using residual shortcuts, the model bypasses vanishing gradient bottlenecks during training, making it highly sensitive to micro-textures, lesions, and chlorosis on leaf surfaces.
⚙️ Interactive 6-Step Frontend Visual Pipeline
Rather than simple "Instant Loading", our UX provides an interactive, detailed visual breakdown of how the deep inference runs:
Initialising model... - Memory allocation for network weights.
Preprocessing image... - Resizes leaf photos to exactly 224×224 pixels and normalizes RGB arrays.
Running inference... - Passes vectors through the 50 hidden convolutional layers.
Classifying 38 classes... - Maps feature vectors to PlantVillage boundaries.
Computing confidence... - Normalizes output nodes through a Softmax function to generate reliable top-3 scores.
Enriching results... - Queries the localized Database to attach organic treatment checklists.
📚 Sample Prediction Knowledge Base
Tomato — Early Blight (Fungal Alternaria solani): Prescribes structural pruning, airflow expansion, and copper-based organic fungicides.
Potato — Late Blight (Oomycete Phytophthora infestans): Highlights critical moisture management and Mancozeb barrier treatments.
Corn — Healthy: Suggests standard biological pest preventative maintenance.
🌌 Visual Philosophy & Micro-Interactions
The UI is built with a dark glassmorphic theme configured to reduce visual fatigue in low-light environments (clinical clinics or outdoor crop farms):
Visual Palette:
Background: Deep Space Obsidian (#08080d)
Vitals / Human Medicine: Electric Cyber Blue (#3b82f6)
Agriculture / Crop Health: Chlorophyll Green (#22c55e)
Hardware-Accelerated Animation Classes:
.cam-wave: Uses hardware-accelerated SVG dash-offset keyframes to simulate a beating, live pulse signal.
.scan-line: A CSS-powered neon green sweeping ray that scales down uploaded leaf targets.
.btn-shake: Micro-interaction that physically shakes UI buttons if facial landmarks are blocked, giving instant haptic feel without disrupting browser flow with alerts.
vital-3-hackathon/
├── css/                   # Modular UI Style Sheets
│   ├── tokens.css         # Design system tokens (colors, variables, resets)
│   ├── sidebar.css        # Interactive track routing tabs
│   ├── camera.css         # Live webcam overlays, waves, and responsive views
│   ├── agriculture.css    # Drag-and-drop file drop zones, sample card selections
│   └── workspace.css      # Glass cards, grids, transitions, and loading lines
├── js/                    # Core Client-Side Logic
│   ├── data.js            # Offline Crop Disease KB and mock simulation profiles
│   ├── app.js             # Navigation, track router, and dashboard toggler
│   ├── camera.js          # WebRTC getUserMedia handlers and custom skin heuristic fallbacks
│   ├── medicine.js        # Vitals acquisition timeline, countdowns, and report renderer
│   └── agriculture.js     # Image loading, canvas transformations, and pipeline scheduler
├── rPPG/                  # Standalone Desktop Core Python Engine
│   └── run_pules.py       # Live hardware-accelerated webcam rPPG via OpenCV
├── index.html             # High-performance, single-page application entry point
├── LICENSE                # MIT Open Source License
└── README.md              # Project Documentation (You are here!)
💻 Setup & Installation (30 Seconds)
🌐 Method A: Running the Web Interface
The web app is purely client-side with no complex build steps required.
Clone the project:
Launch a local web server (Recommended to bypass local iframe & CDN CORS policies):
Open http://localhost:8000 in any modern web browser.
🐍 Method B: Running the Standalone Python rPPG Script
For a high-performance local desktop terminal implementation of face-absorption tracking:
Move to the directory and install requirements:
Run the application:
How to use: Align your face with the green box overlay. The console will continuously compute and print real-time heart rate updates directly from skin pixel absorption data. Press q to terminate.
🎓 Team & Recognition
🏆 Winner of Vital 3 Hackathon (CODE:VITAL 2026)
Formulated under the research guidance of AKS University.
Proudly published open-source under the MIT License.

---

### 💡 Iske baad kya karna hai?
Aap apne computer ya GitHub repository par jaakar `README.md` file ko edit karke upar ka pura content paste kar lijiye. Recruiter ko main interface ekdam clean aur concise dikhega, aur detail dekhne ke liye woh simply **dropdown (details arrow)** par click kar sakega!

🚀 Agar aap isme team members ke Github profiles ya dynamic demo links add karwana chahte hain, toh mujhe batayein!
