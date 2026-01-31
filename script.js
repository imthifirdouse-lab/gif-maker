const fileInput = document.getElementById('file-input');
const frameContainer = document.getElementById('frame-container');
const renderBtn = document.getElementById('render-btn');
const outputArea = document.getElementById('output-area');

let frames = [];

fileInput.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
        const url = URL.createObjectURL(file);
        addFrameToUI(url);
    }
});

function addFrameToUI(url) {
    const id = Date.now() + Math.random();
    const div = document.createElement('div');
    div.className = 'frame-card';
    div.dataset.id = id;
    div.innerHTML = `
        <button class="remove-btn" onclick="removeFrame(${id})">×</button>
        <img src="${url}">
        <input type="number" class="frame-delay" placeholder="Delay (ms)" value="">
    `;
    frameContainer.appendChild(div);
    frames.push({ id, url });
}

window.removeFrame = (id) => {
    frames = frames.filter(f => f.id !== id);
    document.querySelector(`[data-id="${id}"]`).remove();
};

renderBtn.addEventListener('click', () => {
    if (frames.length === 0) return alert("Add frames first");

    const globalDelay = document.getElementById('global-delay').value;
    const loop = document.getElementById('loop-count').value;
    
    const gif = new GIF({
        workers: 4,
        quality: 10,
        workerScript: 'gif.worker.js',
        repeat: loop
    });

    const frameElements = document.querySelectorAll('.frame-card');
    let loadedCount = 0;

    frameElements.forEach((el) => {
        const img = el.querySelector('img');
        const specificDelay = el.querySelector('.frame-delay').value;
        
        // Ensure image is loaded before adding to GIF
        const tempImg = new Image();
        tempImg.onload = () => {
            gif.addFrame(tempImg, { delay: specificDelay || globalDelay });
            loadedCount++;
            if (loadedCount === frameElements.length) gif.render();
        };
        tempImg.src = img.src;
    });

    gif.on('finished', (blob) => {
        const url = URL.createObjectURL(blob);
        outputArea.innerHTML = `
            <h3>Result:</h3>
            <img src="${url}"><br>
            <a href="${url}" download="animation.gif"><button style="margin-top:10px">Download GIF</button></a>
        `;
    });
});