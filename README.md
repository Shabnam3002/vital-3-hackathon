<h2 align="center"> VITAL 3 (2026 Hackathon Winner)</h2>
<h2 align="center"> Dual-Track Diagnostics</h2>
<p align="center">
<img src="https://skillicons.dev/icons?i=js,html,css,python"/>
</p>

**Duo-Diagnose** is a high-fidelity research prototype that replaces expensive medical and agricultural screening hardware with standard webcam feed and computer vision.
# 🩺 AI Vitals & Crop Health Interface 🌾

[![Hackathon Win](https://img.shields.io/badge/Hackathon-Vital%203%20Winner-gold?style=for-the-badge&logo=github)](https://github.com/Shabnam3000/vital-3-hackathon)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Event](https://img.shields.io/badge/Event-CODE%3AVITAL%202026-brightgreen?style=for-the-badge)](https://github.com/Shabnam3000/vital-3-hackathon)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Python-orange?style=for-the-badge&logo=javascript)](https://github.com/Shabnam3000/vital-3-hackathon)

> **$\color{red}{\text{Diagnostics for People and Plants—Powered by a Single Camera Feed.}}$**
> An award-winning, state-of-the-art dual-track diagnostic platform developed for **CODE:VITAL 2026 (Vital 3 Hackathon)** representing **AKS University**.
###  Science of rPPG
* **Concept:** $\color{red}{\text{Heartbeats cause micro-fluctuations}}$ in $\color{yellow }{\text{facial blood volume}}$, modifying skin light absorption.
* **Method:** Extracts $\color{red}{\text{raw pulse waves}}$ by analyzing $\color{yellow}{\text{webcam pixel color changes}}$ over a **15-second scan**.

###  Dual-Layer Face Tracking
* **Primary Path:** Uses `face-api.js` (TinyFaceDetector) to track the $\color{red}{\text{forehead Region}}$ of Interest (ROI).
* **Offline Fallback:** Custom RGB $\color{red}{\text{skin-tone filter}}$ rejects background noise when offline:
  $$\text{Skin Filter: } R>90 \land G>40 \land B>20 \land R>G \land R>B$$

###  Local Diagnostics & RMSSD Engine
* **$\color{red}{\text{Metrics}}$:** Computes $\color{yellow}{\text{real-time Heart Rate}}$ (BPM) and Oxygen Saturation ($SpO_2$) completely in-browser.
* **$\color{red}{\text{Stress Monitor}}$:** Tracks heart rate variability (RMSSD). Low RMSSD (**< 20ms** / High Stress) triggers automated recommendations like the **4-7-8 Breathing Technique**.


Diagnostics in $\color{green}{\text{human medicine}}$ and $\color{green}{\text{crop science}}$ share a fundamental bottleneck: early-stage detection requires specialized, expensive hardware.

**For Humans:** Traditional clinical monitoring requires $\color{green}{\text{pulse oximeters, ECGs, and chest straps.}}$

**For Crops:** Agronomists rely on laboratory tissue sampling or expensive field spectrometers to identify diseases.

**Duo-Diagnose solves both problems with a standard camera.** By applying advanced computer vision— $\color{yellow}{\text{Remote Photoplethysmography (rPPG)}}$ on skin pixels and $\color{yellow}{\text{ResNet-50 Deep Convolutional Networks**}}$ on plant leaves—the platform performs $\color{red}{\text{high-accuracy real-time}}$ screening using consumer-grade $\color{green}{\text{webcams}}$ and $\color{green}{\text{smartphone cameras}}$.

---
### Tech Stack & Toolkit
| Layer | Technologies & Frameworks |
| :--- | :--- |
| **Computer Vision (JS)** | `face-api.js` (Lightweight TinyFaceDetector neural network ) |
| **Algorithms (JS)** | Custom RGB Skin-Tone Segmentation Heuristics |<!-- (Offline webcam face fallback) |-->
| **Deep Learning (AI)** | **ResNet-50 Convolutional Neural Network** |<!-- trained on the *PlantVillage* dataset (38 classes) | -->
| **Local Desktop App** | Python, OpenCV (FacePhys computer vision module)| <!-- `run_pules.py` camera processor | -->
<!--| **Frontend UI/UX** | HTML5, CSS3 Grid/Flexbox, Custom Glassmorphic CSS Variables, Hardware-Accelerated Keyframes |-->

---
### 🌟 Why this project stands out:
1. **🏆 Winner of Vital 3 Hackathon (CODE:VITAL 2026)** out of numerous competitive entries.
 <img width="48%"  alt="Image" src="https://github.com/user-attachments/assets/b893490b-71bb-41a5-b58c-1949c5739de2" />
<img width="48%"  alt="Image" src="https://github.com/user-attachments/assets/d441f7f3-65d7-473d-a39a-6feae580f66c" />
 <img width="60%"  alt="Image" src="https://github.com/user-attachments/assets/c7faae6b-944d-4ee7-8b0f-f2a5d04c355c" />
 
---

> [!IMPORTANT]
> ### 🤖 CONTACTLESS HEALTH TRACKING (rPPG)
> Extracts live **`Heart Rate (BPM)`**, **`HRV (RMSSD)`**, **`Stress Levels`**, and **`Oxygen Levels (SpO₂)`** directly from forehead and cheek blood-volume changes using just a standard laptop webcam. **Zero external hardware required!**

---  

> [!TIP]
> ### 🌾 AGRI-TECH AI INTEGRATION (ResNet-50)
> Implements a deep-learning convolutional neural network pipeline using **`ResNet-50`** to analyze leaf structures and detect crop diseases instantly with **`tailor-made organic/chemical treatment advice`**.

---

> [!NOTE]
> ### Zero-Latency Local Architecture:
>  Features an offline-capable, highly-responsive frontend that performs **`face-tracking fallbacks`** and localized expert reasoning with **`zero external API dependencies`**.
