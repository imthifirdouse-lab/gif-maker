# 🎞️ Client-Side GIF Maker

A lightweight, privacy-focused web tool to create animated GIFs from multiple images. This application runs entirely in the browser using **GIF.js**, meaning your images are never uploaded to a server.

## 🚀 Features
* **Multi-Frame Support:** Upload multiple JPG, PNG, or WebP files simultaneously.
* **Global & Individual Controls:** Set a global frame delay or override timing for specific frames.
* **Loop Configuration:** Toggle between infinite loops or specific repetition counts.
* **Privacy First:** All processing happens locally via Web Workers.
* **Zero Dependencies:** No backend required; optimized for **GitHub Pages**.

## 🛠️ Technical Stack
* **Frontend:** HTML5, CSS3 (Flexbox/Grid), JavaScript (ES6+).
* **Engine:** [GIF.js](https://jnordberg.github.io/gif.js/) - Full-featured GIF encoder.
* **Hosting:** GitHub Pages.

## 📂 Project Structure
```text
├── index.html       # UI and Layout
├── script.js        # Logic for frame handling and GIF rendering
├── gif.worker.js    # Required Web Worker for background processing
└── README.md        # Documentation