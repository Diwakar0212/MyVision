class VideoAuthentication {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.checkAuthentication();

        // Object detection state
        this.detectCanvas = null;
        this.detectCtx = null;
        this.fileInput = null;
        this.runDetectionBtn = null;
        this.clearDetectionBtn = null;
        this.resultsList = null;
        this.detectionResults = null;
        this.loadedMedia = null; // HTMLImageElement or HTMLVideoElement
        this.model = null; // coco-ssd model
        this.isModelLoading = false;
        this.isDetecting = false;

        // Voice command state
        this.recognition = null;
        this.isListening = false;
        this.initVoice();
        // expose instance for debugging / external control
        try { window.app = this; } catch(e){}
    }

    initializeElements() {
        this.logoutBtn = document.getElementById('logoutBtn');

        // Detection elements
        this.detectCanvas = document.getElementById('detectCanvas');
        this.detectCtx = this.detectCanvas ? this.detectCanvas.getContext('2d') : null;
        this.fileInput = document.getElementById('fileInput');
        this.runDetectionBtn = document.getElementById('runDetection');
        this.clearDetectionBtn = document.getElementById('clearDetection');
        this.resultsList = document.getElementById('resultsList');
        this.detectionResults = document.getElementById('detectionResults');

        // Voice elements
        this.voiceBtn = document.getElementById('voiceCommands');
        this.voiceStatus = document.getElementById('voiceStatus');

        // URL / drag-drop elements
        this.urlInput = document.getElementById('urlInput');
        this.loadUrlBtn = document.getElementById('loadUrlBtn');
        this.inputCard = document.getElementById('inputCard');
        this.filePathDisplay = document.getElementById('filePathDisplay');
    }

    bindEvents() {
        try {
            if (this.logoutBtn) {
                this.logoutBtn.addEventListener('click', () => this.logout());
            }

            // Detection events
            if (this.fileInput) {
                this.fileInput.addEventListener('change', (e) => this.handleFileSelected(e));
            }
            // Allow clicking the readonly file path display to open the hidden file picker
            if (this.filePathDisplay && this.fileInput) {
                try { this.filePathDisplay.style.cursor = 'pointer'; } catch(e){}
                this.filePathDisplay.addEventListener('click', () => {
                    if (this.fileInput) this.fileInput.click();
                });
            }
            // Allow clicking the input card (background area) to open file picker as well,
            // but avoid opening when interacting with URL input/button or other controls inside the card.
            if (this.inputCard && this.fileInput) {
                this.inputCard.addEventListener('click', (e) => {
                    const target = e.target;
                    // If user clicked on an input, button, or inside the url-group, don't open the file picker
                    if (target.closest && (target.closest('input') || target.closest('button') || target.closest('.url-group') || target.closest('.voice-btn'))) {
                        return;
                    }
                    // Otherwise open the picker
                    this.fileInput.click();
                });
            }
            // clicking visible mic button should open file picker as alternative
            if (this.voiceBtn && this.fileInput) {
                this.voiceBtn.addEventListener('click', (e) => {
                    // if voice is supported, toggleVoice handles it; otherwise open file picker
                    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
                    if (!SR) {
                        this.fileInput.click();
                    }
                });
            }
            if (this.runDetectionBtn) {
                this.runDetectionBtn.addEventListener('click', () => this.handleRunDetection());
            }
            if (this.clearDetectionBtn) {
                this.clearDetectionBtn.addEventListener('click', () => this.clearDetection());
            }

            if (this.voiceBtn) {
                this.voiceBtn.addEventListener('click', () => this.toggleVoice());
            }

            // URL loading
            if (this.loadUrlBtn && this.urlInput) {
                this.loadUrlBtn.addEventListener('click', () => this.loadFromUrl(this.urlInput.value.trim()));
            }

            // Expose drag & drop handlers
            if (this.inputCard) {
                this.inputCard.addEventListener('dragover', (e) => { e.preventDefault(); this.inputCard.classList.add('dragover'); });
                this.inputCard.addEventListener('dragleave', () => this.inputCard.classList.remove('dragover'));
                this.inputCard.addEventListener('drop', (e) => {
                    e.preventDefault();
                    this.inputCard.classList.remove('dragover');
                    const dt = e.dataTransfer;
                    if (dt && dt.files && dt.files.length) {
                        // handle first file
                        const file = dt.files[0];
                        // populate fileInput for consistency
                        if (this.fileInput) {
                            const dataTransfer = new DataTransfer();
                            dataTransfer.items.add(file);
                            this.fileInput.files = dataTransfer.files;
                            this.handleFileSelected({ target: this.fileInput });
                        }
                    } else if (dt && dt.getData) {
                        const url = dt.getData('text/uri-list') || dt.getData('text/plain');
                        if (url) this.loadFromUrl(url.trim());
                    }
                });
            }
        } catch (error) {
            console.error('Error binding events:', error);
        }
    }

    initVoice() {
        try {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SR) {
                if (this.voiceBtn) this.voiceBtn.disabled = true;
                if (this.voiceStatus) this.voiceStatus.textContent = 'Voice: Unsupported';
                return;
            }
            this.recognition = new SR();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.isListening = true;
                if (this.voiceStatus) this.voiceStatus.textContent = 'Voice: Listening...';
            };
            this.recognition.onend = () => {
                this.isListening = false;
                if (this.voiceStatus) this.voiceStatus.textContent = 'Voice: Idle';
            };
            this.recognition.onerror = (e) => {
                console.error('Voice error:', e);
                if (this.voiceStatus) this.voiceStatus.textContent = 'Voice: Error';
            };
            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(r => r[0].transcript)
                    .join(' ')
                    .toLowerCase()
                    .trim();
                this.handleVoiceCommand(transcript);
            };
        } catch (e) {
            console.error('Voice init failed:', e);
        }
    }

    toggleVoice() {
        if (!this.recognition) return;
        if (this.isListening) {
            try { this.recognition.stop(); } catch {}
        } else {
            try { this.recognition.start(); } catch {}
        }
    }

    async handleVoiceCommand(text) {
        // Supported commands:
        // "choose file" -> open file picker
        // "run detection" / "start detection" -> run detection
        // "clear" / "reset" -> clear canvas and results
        // "load sample image" / "load sample video"
        if (!text) return;
        console.log('Voice command:', text);

        if (text.includes('choose file') || text.includes('select file') || text.includes('open file')) {
            if (this.fileInput) this.fileInput.click();
            this.showNotification('Opening file picker...', 'success');
            return;
        }
        if (text.includes('run detection') || text.includes('start detection')) {
            if (this.runDetectionBtn && !this.runDetectionBtn.disabled) {
                this.handleRunDetection();
            } else {
                this.showNotification('Please choose a file first', 'error');
            }
            return;
        }
        if (text.includes('clear') || text.includes('reset')) {
            this.clearDetection();
            this.showNotification('Cleared', 'success');
            return;
        }

        if (text.includes('load sample image')) {
            this.loadSample('image');
            return;
        }
        if (text.includes('load sample video')) {
            this.loadSample('video');
            return;
        }

        this.showNotification('Unknown voice command', 'error');
    }

    loadSample(type) {
        // Lightweight placeholder samples via data URL to avoid network fetches
        if (type === 'image') {
            const img = new Image();
            img.onload = () => {
                this.loadedMedia = img;
                this.fitCanvasToMedia(img.width, img.height);
                this.drawMediaToCanvas();
                if (this.runDetectionBtn) this.runDetectionBtn.disabled = false;
                if (this.clearDetectionBtn) this.clearDetectionBtn.disabled = false;
                this.showNotification('Sample image loaded', 'success');
            };
            // 1x1 black png
            img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAtIBw7iQvX0AAAAASUVORK5CYII=';
        } else if (type === 'video') {
            const vid = document.createElement('video');
            vid.autoplay = false;
            vid.muted = true;
            vid.playsInline = true;
            vid.addEventListener('loadeddata', () => {
                this.loadedMedia = vid;
                this.fitCanvasToMedia(vid.videoWidth || 320, vid.videoHeight || 240);
                this.drawMediaToCanvas();
                if (this.runDetectionBtn) this.runDetectionBtn.disabled = false;
                if (this.clearDetectionBtn) this.clearDetectionBtn.disabled = false;
                this.showNotification('Sample video loaded', 'success');
            });
            // Minimal data URL won't be a valid video stream for real detection; kept as placeholder
            vid.src = '';
            vid.load();
        }
    }

    checkAuthentication() {
        const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
        if (!isAuthenticated) {
            this.showNotification('Please login first', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    async ensureModelLoaded() {
        if (this.model || this.isModelLoading) return;
        try {
            this.isModelLoading = true;
            this.updateStatus('Loading detection model...', 'processing');
            
            // Check if cocoSsd is available
            if (typeof cocoSsd === 'undefined') {
                throw new Error('COCO-SSD model not loaded. Please check your internet connection.');
            }
            
            this.model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
            this.updateStatus('Model loaded. Ready for detection', 'success');
        } catch (error) {
            console.error('Error loading model:', error);
            this.showNotification('Failed to load detection model: ' + error.message, 'error');
        } finally {
            this.isModelLoading = false;
        }
    }

    async loadFromUrl(url) {
        if (!url) {
            this.showNotification('Please enter a valid URL', 'error');
            return;
        }
        try {
            this.updateStatus('Loading from URL...', 'processing');
            // Best-effort: fetch HEAD to determine content-type
            let contentType = '';
            try {
                const res = await fetch(url, { method: 'HEAD' });
                contentType = res.headers.get('content-type') || '';
            } catch (e) {
                // Some servers block HEAD or CORS — fall back to extension
                const ext = url.split('.').pop().split(/[#?]/)[0].toLowerCase();
                if (['jpg','jpeg','png','gif','webp'].includes(ext)) contentType = 'image/*';
                if (['mp4','webm','ogg'].includes(ext)) contentType = 'video/*';
            }

            // create element depending on content type
            if (contentType.startsWith('image') || url.match(/\.(jpg|jpeg|png|gif|webp)([?#].*)?$/i)) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    this.loadedMedia = img;
                    this.fitCanvasToMedia(img.width, img.height);
                    this.drawMediaToCanvas();
                    if (this.runDetectionBtn) this.runDetectionBtn.disabled = false;
                    if (this.clearDetectionBtn) this.clearDetectionBtn.disabled = false;
                    if (this.filePathDisplay) this.filePathDisplay.value = url;
                    this.showNotification('Image loaded from URL', 'success');
                };
                img.onerror = () => this.showNotification('Failed to load image from URL', 'error');
                img.src = url;
            } else if (contentType.startsWith('video') || url.match(/\.(mp4|webm|ogg)([?#].*)?$/i)) {
                const vid = document.createElement('video');
                vid.crossOrigin = 'anonymous';
                vid.src = url;
                vid.autoplay = false;
                vid.muted = true;
                vid.playsInline = true;
                vid.addEventListener('loadeddata', () => {
                    this.loadedMedia = vid;
                    this.fitCanvasToMedia(vid.videoWidth || 320, vid.videoHeight || 240);
                    this.drawMediaToCanvas();
                    if (this.runDetectionBtn) this.runDetectionBtn.disabled = false;
                    if (this.clearDetectionBtn) this.clearDetectionBtn.disabled = false;
                    if (this.filePathDisplay) this.filePathDisplay.value = url;
                    this.showNotification('Video loaded from URL', 'success');
                });
                vid.addEventListener('error', () => this.showNotification('Failed to load video from URL', 'error'));
                vid.load();
            } else {
                this.showNotification('Unknown or unsupported URL type', 'error');
            }
        } catch (err) {
            console.error('loadFromUrl error', err);
            this.showNotification('Error loading URL: ' + err.message, 'error');
        } finally {
            this.updateStatus('Ready', 'ready');
        }
    }

    handleFileSelected(event) {
        try {
            const file = event.target.files && event.target.files[0];
            if (!file) return;

            // Reset
            this.clearDetection(true);

            const url = URL.createObjectURL(file);
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (!isImage && !isVideo) {
                this.showNotification('Please select an image or video file', 'error');
                return;
            }

            if (isImage) {
                const img = new Image();
                if (this.filePathDisplay) this.filePathDisplay.value = file.name;
                img.onload = () => {
                    this.loadedMedia = img;
                    this.fitCanvasToMedia(img.width, img.height);
                    this.drawMediaToCanvas();
                    if (this.runDetectionBtn) this.runDetectionBtn.disabled = false;
                    if (this.clearDetectionBtn) this.clearDetectionBtn.disabled = false;
                };
                img.onerror = () => {
                    this.showNotification('Failed to load image', 'error');
                };
                img.src = url;
            } else if (isVideo) {
                const vid = document.createElement('video');
                if (this.filePathDisplay) this.filePathDisplay.value = file.name;
                vid.src = url;
                vid.autoplay = false;
                vid.muted = true;
                vid.playsInline = true;
                vid.addEventListener('loadeddata', () => {
                    this.loadedMedia = vid;
                    this.fitCanvasToMedia(vid.videoWidth, vid.videoHeight);
                    this.drawMediaToCanvas();
                    if (this.runDetectionBtn) this.runDetectionBtn.disabled = false;
                    if (this.clearDetectionBtn) this.clearDetectionBtn.disabled = false;
                });
                vid.addEventListener('ended', () => {
                    this.isDetecting = false;
                    if (this.runDetectionBtn) this.runDetectionBtn.disabled = false;
                });
                vid.addEventListener('error', () => {
                    this.showNotification('Failed to load video', 'error');
                });
                // Start playing to allow frame extraction when detecting
                vid.load();
            }
        } catch (error) {
            console.error('Error handling file selection:', error);
            this.showNotification('Error loading file: ' + error.message, 'error');
        }
    }

    fitCanvasToMedia(width, height) {
        if (!this.detectCanvas) return;
        // Keep within 640x480 box with aspect ratio
        const maxW = 640, maxH = 480;
        let w = width, h = height;
        const ratio = Math.min(maxW / w, maxH / h, 1);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
        this.detectCanvas.width = w;
        this.detectCanvas.height = h;
    }

    drawMediaToCanvas() {
        if (!this.loadedMedia || !this.detectCtx) return;
        const w = this.detectCanvas.width;
        const h = this.detectCanvas.height;
        this.detectCtx.clearRect(0, 0, w, h);
        // Draw centered with letterboxing if aspect differs
        const mediaW = this.loadedMedia.videoWidth || this.loadedMedia.width;
        const mediaH = this.loadedMedia.videoHeight || this.loadedMedia.height;
        const scale = Math.min(w / mediaW, h / mediaH);
        const drawW = Math.round(mediaW * scale);
        const drawH = Math.round(mediaH * scale);
        const dx = Math.floor((w - drawW) / 2);
        const dy = Math.floor((h - drawH) / 2);
        this.detectCtx.drawImage(this.loadedMedia, dx, dy, drawW, drawH);
        return { dx, dy, drawW, drawH, scale };
    }

    async handleRunDetection() {
        try {
            if (!this.loadedMedia) {
                this.showNotification('Please select a file first', 'error');
                return;
            }
            await this.ensureModelLoaded();
            if (!this.model) return;

            // Disable during detection
            if (this.runDetectionBtn) this.runDetectionBtn.disabled = true;
            this.clearResultsUI();
            if (this.detectionResults) this.detectionResults.style.display = 'block';

            const isVideo = this.loadedMedia instanceof HTMLVideoElement;
            if (isVideo) {
                this.isDetecting = true;
                // Play video and detect per frame
                this.loadedMedia.play();
                const detectFrame = async () => {
                    if (!this.isDetecting || this.loadedMedia.ended) return;
                    const geom = this.drawMediaToCanvas();
                    await this.detectOnCurrentCanvas(geom);
                    requestAnimationFrame(detectFrame);
                };
                detectFrame();
            } else {
                const geom = this.drawMediaToCanvas();
                await this.detectOnCurrentCanvas(geom);
                if (this.runDetectionBtn) this.runDetectionBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error running detection:', error);
            this.showNotification('Detection failed: ' + error.message, 'error');
            if (this.runDetectionBtn) this.runDetectionBtn.disabled = false;
        }
    }

    async detectOnCurrentCanvas(geom) {
        try {
            // Create a tensor from canvas
            const predictions = await this.model.detect(this.detectCanvas);
            // Redraw media
            this.drawMediaToCanvas();
            // Draw boxes
            this.renderDetections(predictions, geom);
            // Update list
            this.updateResultsList(predictions);
        } catch (error) {
            console.error('Detection error:', error);
            this.showNotification('Detection failed', 'error');
        }
    }

    renderDetections(predictions, geom) {
        if (!this.detectCtx) return;
        const ctx = this.detectCtx;
        ctx.lineWidth = 2;
        ctx.font = '14px Segoe UI';
        predictions.forEach(pred => {
            const [x, y, w, h] = pred.bbox;
            ctx.strokeStyle = '#00e676';
            ctx.fillStyle = 'rgba(0, 230, 118, 0.2)';
            ctx.strokeRect(x, y, w, h);
            ctx.fillRect(x, y, w, h);
            const label = `${pred.class} ${(pred.score * 100).toFixed(1)}%`;
            const textW = ctx.measureText(label).width + 8;
            const textH = 18;
            ctx.fillStyle = '#00e676';
            ctx.fillRect(x, Math.max(0, y - textH), textW, textH);
            ctx.fillStyle = '#0b2e13';
            ctx.fillText(label, x + 4, Math.max(12, y - 4));
        });
    }

    updateResultsList(predictions) {
        if (!this.resultsList) return;
        this.resultsList.innerHTML = '';
        const counts = new Map();
        predictions.forEach(p => {
            counts.set(p.class, (counts.get(p.class) || 0) + 1);
        });
        Array.from(counts.entries()).forEach(([label, count]) => {
            const li = document.createElement('li');
            li.textContent = `${label} x${count}`;
            this.resultsList.appendChild(li);
        });
        if (predictions.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No objects detected';
            this.resultsList.appendChild(li);
        }
    }

    clearResultsUI() {
        if (this.resultsList) this.resultsList.innerHTML = '';
    }

    clearDetection(soft = false) {
        this.isDetecting = false;
        if (this.loadedMedia instanceof HTMLVideoElement) {
            this.loadedMedia.pause();
            this.loadedMedia.currentTime = 0;
        }
        this.loadedMedia = null;
        if (this.detectCtx) {
            this.detectCtx.clearRect(0, 0, this.detectCanvas.width, this.detectCanvas.height);
        }
        if (!soft && this.fileInput) {
            this.fileInput.value = '';
        }
        if (this.runDetectionBtn) this.runDetectionBtn.disabled = true;
        if (this.clearDetectionBtn) this.clearDetectionBtn.disabled = true;
        if (this.detectionResults) this.detectionResults.style.display = 'none';
    }

    async startVideo() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            this.videoElement.srcObject = this.stream;
            this.isVideoActive = true;
            
            this.updateUI(true);
            this.updateStatus('Video started - Position your face in the center', 'processing');
            this.instructions.style.display = 'block';
            
            // Start face detection simulation
            this.startFaceDetection();
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.updateStatus('Camera access denied', 'error');
            this.showNotification('Please allow camera access for video authentication', 'error');
        }
    }

    stopVideo() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        this.videoElement.srcObject = null;
        this.isVideoActive = false;
        
        this.updateUI(false);
        this.updateStatus('Video stopped', 'ready');
        this.instructions.style.display = 'none';
        this.faceBox.style.display = 'none';
        
        if (this.faceDetectionInterval) {
            clearInterval(this.faceDetectionInterval);
            this.faceDetectionInterval = null;
        }
    }

    startFaceDetection() {
        // Simulate face detection (in a real app, you'd use a face detection library)
        this.faceDetectionInterval = setInterval(() => {
            if (this.isVideoActive) {
                this.simulateFaceDetection();
            }
        }, 1000);
    }

    simulateFaceDetection() {
        // Simulate face detection with random results
        const hasFace = Math.random() > 0.3; // 70% chance of detecting a face
        
        if (hasFace) {
            this.faceBox.style.display = 'block';
            this.faceBox.style.left = '25%';
            this.faceBox.style.top = '20%';
            this.faceBox.style.width = '50%';
            this.faceBox.style.height = '60%';
            this.faceBox.classList.add('detected');
            
            this.capturePhotoBtn.disabled = false;
            this.updateStatus('Face detected - Ready to capture', 'success');
        } else {
            this.faceBox.style.display = 'none';
            this.faceBox.classList.remove('detected');
            this.capturePhotoBtn.disabled = true;
            this.updateStatus('Position your face in the center', 'processing');
        }
    }

    capturePhoto() {
        if (!this.isVideoActive) return;

        const canvas = this.canvasElement;
        const video = this.videoElement;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        this.capturedImageData = canvas.toDataURL('image/jpeg', 0.8);
        this.photoPreview.src = this.capturedImageData;
        
        this.capturedPhoto.style.display = 'block';
        this.verifyPhotoBtn.disabled = false;
        
        this.updateStatus('Photo captured - Click verify to authenticate', 'success');
    }

    retakePhoto() {
        this.capturedPhoto.style.display = 'none';
        this.verifyPhotoBtn.disabled = true;
        this.capturedImageData = null;
        this.updateStatus('Ready to capture new photo', 'ready');
    }

    async verifyPhoto() {
        if (!this.capturedImageData) return;

        this.verifyPhotoBtn.innerHTML = '<div class="loading"></div> Verifying...';
        this.verifyPhotoBtn.disabled = true;
        
        this.verificationResults.style.display = 'block';
        this.updateStatus('Verifying identity...', 'processing');
        
        // Simulate verification process
        await this.simulateVerification();
    }

    async simulateVerification() {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Simulate verification results
        const results = {
            faceDetection: Math.random() > 0.1, // 90% success rate
            faceMatch: Math.random() > 0.2,    // 80% success rate
            liveness: Math.random() > 0.15     // 85% success rate
        };
        
        // Update results display
        this.updateVerificationResults(results);
        
        // Check if all verifications passed
        const allPassed = Object.values(results).every(result => result);
        
        if (allPassed) {
            this.updateStatus('Verification successful!', 'success');
            this.dashboardAccess.style.display = 'block';
            this.showNotification('Video authentication completed successfully!', 'success');
        } else {
            this.updateStatus('Verification failed - Please try again', 'error');
            this.showNotification('Verification failed. Please retake the photo.', 'error');
            this.verifyPhotoBtn.innerHTML = '<i class="fas fa-check"></i> Verify Identity';
            this.verifyPhotoBtn.disabled = false;
        }
    }

    updateVerificationResults(results) {
        this.faceDetectionResult.textContent = results.faceDetection ? 'Passed' : 'Failed';
        this.faceDetectionResult.className = `result-value ${results.faceDetection ? 'success' : 'error'}`;
        
        this.faceMatchResult.textContent = results.faceMatch ? 'Passed' : 'Failed';
        this.faceMatchResult.className = `result-value ${results.faceMatch ? 'success' : 'error'}`;
        
        this.livenessResult.textContent = results.liveness ? 'Passed' : 'Failed';
        this.livenessResult.className = `result-value ${results.liveness ? 'success' : 'error'}`;
    }

    accessDashboard() {}

    logout() {
        sessionStorage.removeItem('authenticated');
        this.showNotification('Logging out...', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    updateUI() {}

    updateStatus(text, type) {
        const statusTextEl = document.getElementById('statusText');
        const statusIndicatorEl = document.getElementById('statusIndicator');
        if (!statusTextEl || !statusIndicatorEl) return;
        statusTextEl.textContent = text;
        statusIndicatorEl.className = 'status-indicator';
        if (type) statusIndicatorEl.classList.add(type);
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #dc3545, #c82333)';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VideoAuthentication();
});

// (Removed video keyboard shortcuts and visibility handlers)

// Small helper for the Health UI: analyze symptoms (placeholder)
document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const symptomsInput = document.getElementById('symptoms');
    const predictedEl = document.getElementById('predicted');
    const descEl = document.getElementById('description');

    function analyzePlaceholder(text){
        if(!text || !text.trim()){
            predictedEl.innerHTML = '<p class="placeholder">Please enter some symptoms to analyze.</p>';
            descEl.innerHTML = '<p class="placeholder">No description available.</p>';
            return;
        }
        // Basic keyword-based placeholder logic
        const t = text.toLowerCase();
        if(t.includes('fever') || t.includes('temperature')){
            predictedEl.innerHTML = '<div><strong>Possible: Viral infection / Fever</strong></div>';
            descEl.innerHTML = '<p>A fever is a common sign of infection. If persistent or high (>39°C), seek medical care.</p>';
        } else if(t.includes('cough') || t.includes('sore throat')){
            predictedEl.innerHTML = '<div><strong>Possible: Respiratory infection</strong></div>';
            descEl.innerHTML = '<p>Cough and sore throat can indicate a cold, bronchitis or other respiratory conditions. Monitor breathing and consult a clinician if severe.</p>';
        } else if(t.includes('headache')){
            predictedEl.innerHTML = '<div><strong>Possible: Tension headache / Migraine</strong></div>';
            descEl.innerHTML = '<p>Headaches are common and often benign. If accompanied by visual changes, confusion, or weakness, seek immediate care.</p>';
        } else {
            predictedEl.innerHTML = '<div><strong>Possible: General illness</strong></div>';
            descEl.innerHTML = '<p>Symptoms are non-specific. Monitor symptoms and seek professional medical advice for accurate diagnosis.</p>';
        }
    }

    if(analyzeBtn){
        analyzeBtn.addEventListener('click', () => {
            analyzePlaceholder(symptomsInput ? symptomsInput.value : '');
            // simple UI feedback
            analyzeBtn.textContent = 'Analyzed ✓';
            setTimeout(()=> analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze Symptoms', 1400);
        });
    }
});
