const fileInput = document.getElementById('file-input');
const dropZone = document.getElementById('drop-zone');
const frameContainer = document.getElementById('frame-container');
const renderBtn = document.getElementById('render-btn');
const outputArea = document.getElementById('output-area');

let frames = [];

// --- 1. FILE INPUT & DRAG/DROP LOGIC ---

// Handle File Input
fileInput.addEventListener('change', (e) => {
    processFiles(Array.from(e.target.files));
});

// Handle Clipboard Paste
window.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    const pastedFiles = [];
    for (const item of items) {
        if (item.type.indexOf("image") !== -1) {
            pastedFiles.push(item.getAsFile());
        }
    }
    if (pastedFiles.length > 0) processFiles(pastedFiles);
});

// Handle Drag & Drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
    }, false);
});

dropZone.addEventListener('drop', (e) => {
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    processFiles(files);
});

// Click Dropzone to trigger file input
dropZone.addEventListener('click', () => fileInput.click());

function processFiles(files) {
    files.forEach(file => {
        const url = URL.createObjectURL(file);
        addFrameToUI(url);
    });
}

// --- 2. UI MANAGEMENT ---

function addFrameToUI(url) {
    const id = Date.now() + Math.random();
    const div = document.createElement('div');
    div.className = 'frame-card';
    div.dataset.id = id;
    div.innerHTML = `
        <button class="remove-btn" onclick="removeFrame(${id})">×</button>
        <img src="${url}">
        <input type="number" class="frame-delay" placeholder="Delay (ms)">
    `;
    frameContainer.appendChild(div);
    frames.push({ id, url });
}

window.removeFrame = (id) => {
    frames = frames.filter(f => f.id !== id);
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) el.remove();
};

// --- 3. RENDERING & OPTIMIZATION ---

renderBtn.addEventListener('click', async () => {
    if (frames.length === 0) return alert("Please add at least one image first.");

    const globalDelay = document.getElementById('global-delay').value || 200;
    const loop = document.getElementById('loop-count').value || 0;
    const quality = parseInt(document.getElementById('quality-slider').value);
    const targetWidth = parseInt(document.getElementById('resize-width').value);

    // DEBUG: Log start
    console.log("Starting render...");
    outputArea.innerHTML = "<p>⏳ Initializing... Check Console (F12) if stuck.</p>";
    renderBtn.disabled = true;

    try {
        const gif = new GIF({
            workers: 2,
            quality: quality,
            // 👇 ABSOLUTE URL FIX: Forces browser to find the file
            workerScript: 'https://imthifirdouse-lab.github.io/gif-maker/gif.worker.js', 
            repeat: loop,
            width: targetWidth || undefined,
            debug: true
        });

        const frameCards = document.querySelectorAll('.frame-card');
        
        // Load all images first
        for (const card of frameCards) {
            const imgEl = card.querySelector('img');
            const specificDelay = card.querySelector('.frame-delay').value;
            
            const img = new Image();
            img.src = imgEl.src;
            // CrossOrigin is vital for canvas manipulation if images come from external URLs
            img.crossOrigin = "Anonymous"; 
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    let w = img.width;
                    let h = img.height;

                    // Resize Logic
                    if (targetWidth && w > targetWidth) {
                        const ratio = targetWidth / w;
                        w = targetWidth;
                        h = img.height * ratio;
                    }

                    canvas.width = w;
                    canvas.height = h;
                    ctx.drawImage(img, 0, 0, w, h);

                    gif.addFrame(canvas, { 
                        delay: parseInt(specificDelay) || parseInt(globalDelay), 
                        copy: true 
                    });
                    resolve();
                };
                img.onerror = (e) => {
                    console.error("Failed to load image", e);
                    reject("Image failed to load");
                };
            });
        }

        outputArea.innerHTML = "<p>⚙️ Processing frames... (Worker started)</p>";

        gif.on('finished', (blob) => {
            console.log("Finished!");
            renderBtn.disabled = false;
            const url = URL.createObjectURL(blob);
            const mbSize = (blob.size / (1024 * 1024)).toFixed(2);
            
            outputArea.innerHTML = `
                <div style="padding: 20px; border-top: 2px solid #eee;">
                    <h3>Success! Final Size: ${mbSize} MB</h3>
                    <img src="${url}">
                    <br>
                    <a href="${url}" download="my-animation.gif" class="download-btn">Download GIF</a>
                </div>
            `;
        });
        
        gif.on('abort', () => {
            outputArea.innerHTML = "<p style='color:red'>❌ Error: Generation Aborted.</p>";
            renderBtn.disabled = false;
        });

        gif.render();

    } catch (error) {
        console.error(error);
        outputArea.innerHTML = `<p style='color:red'>❌ Error: ${error.message}. <br>Check Console (F12) for details.</p>`;
        renderBtn.disabled = false;
    }
});
