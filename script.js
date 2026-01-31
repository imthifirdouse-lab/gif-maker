renderBtn.addEventListener('click', () => {
    if (frames.length === 0) return alert("Add frames first");

    const globalDelay = document.getElementById('global-delay').value;
    const loop = document.getElementById('loop-count').value;
    const quality = parseInt(document.getElementById('quality-slider').value);
    const targetWidth = parseInt(document.getElementById('resize-width').value);
    
    const gif = new GIF({
        workers: 4,
        quality: quality, // Lower quality value in GIF.js = better quality, higher = faster/smaller
        workerScript: 'gif.worker.js',
        repeat: loop
    });

    const frameElements = document.querySelectorAll('.frame-card');
    let loadedCount = 0;

    frameElements.forEach((el) => {
        const img = el.querySelector('img');
        const specificDelay = el.querySelector('.frame-delay').value;
        
        const tempImg = new Image();
        tempImg.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Logic for Resizing
            let width = tempImg.width;
            let height = tempImg.height;

            if (targetWidth && targetWidth < width) {
                const ratio = targetWidth / width;
                width = targetWidth;
                height = tempImg.height * ratio;
            }

            canvas.width = width;
            canvas.height = height;
            
            // Draw image to canvas (downsampling)
            ctx.drawImage(tempImg, 0, 0, width, height);
            
            gif.addFrame(canvas, { 
                delay: specificDelay || globalDelay,
                copy: true // Required when passing a canvas
            });

            loadedCount++;
            if (loadedCount === frameElements.length) {
                outputArea.innerHTML = "<p>Optimizing and Rendering...</p>";
                gif.render();
            }
        };
        tempImg.src = img.src;
    });

    gif.on('finished', (blob) => {
        const url = URL.createObjectURL(blob);
        const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
        
        outputArea.innerHTML = `
            <h3>Result (${sizeInMB} MB):</h3>
            <img src="${url}"><br>
            <a href="${url}" download="optimized.gif"><button style="margin-top:10px">Download Optimized GIF</button></a>
        `;
    });
});
