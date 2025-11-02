class AudioLogin {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioBlob = null;
        this.audioUrl = null;
        this.isRecording = false;
        this.recognition = null;
        
        this.initializeElements();
        this.initializeSpeechRecognition();
        this.bindEvents();
    }

    initializeElements() {
        this.startBtn = document.getElementById('startRecording');
        this.stopBtn = document.getElementById('stopRecording');
        this.playBtn = document.getElementById('playRecording');
        this.clearBtn = document.getElementById('clearTranscript');
        this.loginBtn = document.getElementById('loginBtn');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.transcriptDisplay = document.getElementById('transcriptDisplay');
        this.loginForm = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.audioInstructions = document.getElementById('audioInstructions');
        this.authMethodRadios = document.querySelectorAll('input[name="authMethod"]');
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                console.log('Speech recognition started');
                this.updateStatus('Listening...', 'recording');
            };

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                this.updateTranscript(finalTranscript, interimTranscript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                
                // Handle specific error types
                if (event.error === 'not-allowed') {
                    this.updateStatus('Microphone access denied', 'error');
                    this.showNotification('Please allow microphone access for speech recognition', 'error');
                } else if (event.error === 'no-speech') {
                    this.updateStatus('No speech detected', 'error');
                } else if (event.error === 'audio-capture') {
                    this.updateStatus('Microphone not available', 'error');
                } else {
                    this.updateStatus('Recognition error: ' + event.error, 'error');
                }
                
                // Only stop recording if it's a critical error
                if (event.error === 'not-allowed' || event.error === 'audio-capture') {
                    this.stopRecording();
                }
            };

            this.recognition.onend = () => {
                console.log('Speech recognition ended');
                if (this.isRecording) {
                    this.updateStatus('Processing...', 'processing');
                }
            };
        } else {
            console.warn('Speech recognition not supported in this browser');
            this.updateStatus('Speech recognition not supported', 'error');
        }
    }

    bindEvents() {
        // Add double-click prevention to start button
        this.startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!this.isRecording) {
                this.startRecording();
            }
        });
        
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        this.playBtn.addEventListener('click', () => this.playRecording());
        this.clearBtn.addEventListener('click', () => this.clearTranscript());
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Add event listeners for authentication method changes
        this.authMethodRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleAuthMethodChange());
        });
    }

    async startRecording() {
        // Prevent multiple starts
        if (this.isRecording) {
            console.log('Recording already in progress');
            return;
        }

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });

            // Start audio recording
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.audioUrl = URL.createObjectURL(this.audioBlob);
                this.playBtn.disabled = false;
                this.updateStatus('Recording completed', 'success');
            };

            this.mediaRecorder.start();
            this.isRecording = true;

            // Start speech recognition with proper state checking
            if (this.recognition) {
                try {
                    // Check if recognition is already running
                    if (this.recognition.state === 'running') {
                        console.log('Speech recognition already running, stopping first');
                        this.recognition.stop();
                        // Wait a bit before starting again
                        setTimeout(() => {
                            this.recognition.start();
                        }, 100);
                    } else {
                        this.recognition.start();
                    }
                } catch (recognitionError) {
                    console.error('Speech recognition error:', recognitionError);
                    // Continue with audio recording even if speech recognition fails
                    this.updateStatus('Recording (speech recognition unavailable)', 'recording');
                }
            }

            this.updateUI(true);
            this.updateStatus('Recording...', 'recording');

        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.updateStatus('Microphone access denied', 'error');
            this.showNotification('Please allow microphone access to use voice login', 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;

            // Stop speech recognition with proper error handling
            if (this.recognition) {
                try {
                    if (this.recognition.state === 'running') {
                        this.recognition.stop();
                    }
                } catch (error) {
                    console.error('Error stopping speech recognition:', error);
                }
            }

            // Stop all audio tracks
            if (this.mediaRecorder.stream) {
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }

            this.updateUI(false);
        }
    }

    playRecording() {
        if (this.audioUrl) {
            const audio = new Audio(this.audioUrl);
            audio.play().catch(error => {
                console.error('Error playing audio:', error);
                this.showNotification('Error playing recording', 'error');
            });
        }
    }

    updateTranscript(finalTranscript, interimTranscript) {
        let displayText = '';
        
        if (finalTranscript) {
            displayText = `<strong>Final:</strong> ${finalTranscript}`;
        }
        
        if (interimTranscript) {
            displayText += `<br><em>Interim:</em> ${interimTranscript}`;
        }

        if (displayText) {
            this.transcriptDisplay.innerHTML = displayText;
        } else {
            this.transcriptDisplay.innerHTML = '<p>Your voice will be transcribed here...</p>';
        }
    }

    clearTranscript() {
        this.transcriptDisplay.innerHTML = '<p>Your voice will be transcribed here...</p>';
        this.playBtn.disabled = true;
        this.resetRecordingState();
    }

    updateStatus(text, type) {
        this.statusText.textContent = text;
        this.statusIndicator.className = 'status-indicator';
        
        switch (type) {
            case 'recording':
                this.statusIndicator.classList.add('recording');
                break;
            case 'success':
                this.statusIndicator.style.background = '#28a745';
                break;
            case 'error':
                this.statusIndicator.style.background = '#dc3545';
                break;
            case 'processing':
                this.statusIndicator.style.background = '#ffc107';
                break;
            default:
                this.statusIndicator.style.background = '#28a745';
        }
    }

    updateUI(isRecording) {
        this.startBtn.disabled = isRecording;
        this.stopBtn.disabled = !isRecording;
        
        if (isRecording) {
            this.startBtn.innerHTML = '<i class="fas fa-microphone"></i> Recording...';
        } else {
            this.startBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
        }
    }

    resetRecordingState() {
        // Reset all recording-related state
        this.isRecording = false;
        this.audioChunks = [];
        this.audioBlob = null;
        this.audioUrl = null;
        
        // Stop any ongoing speech recognition
        if (this.recognition && this.recognition.state === 'running') {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Error stopping speech recognition during reset:', error);
            }
        }
        
        // Stop any media recorder
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            try {
                this.mediaRecorder.stop();
            } catch (error) {
                console.error('Error stopping media recorder during reset:', error);
            }
        }
        
        this.updateUI(false);
        this.updateStatus('Ready to record', 'ready');
    }

    handleAuthMethodChange() {
        const selectedMethod = document.querySelector('input[name="authMethod"]:checked').value;
        const formGroups = document.querySelectorAll('.form-group');
        
        if (selectedMethod === 'audio-only') {
            // Hide username and password fields for audio-only authentication
            formGroups.forEach(group => {
                group.style.display = 'none';
            });
            this.audioInstructions.style.display = 'block';
        } else {
            // Show username and password fields for other authentication methods
            formGroups.forEach(group => {
                group.style.display = 'block';
            });
            this.audioInstructions.style.display = 'none';
        }
    }

    parseVoiceCommand(transcript) {
        // Parse voice command to extract username and password
        // Expected format: "login as [username] with password [password]"
        const lowerTranscript = transcript.toLowerCase();
        
        console.log('Parsing transcript:', transcript);
        console.log('Lowercase transcript:', lowerTranscript);
        
        // Look for the pattern "login as" followed by username and "with password" followed by password
        // Updated regex to capture everything after "with password" until end or next word
        const loginAsMatch = lowerTranscript.match(/login as (\w+)/);
        const passwordMatch = lowerTranscript.match(/with password (.+?)(?:\s|$)/);
        
        if (loginAsMatch && passwordMatch) {
            const result = {
                username: loginAsMatch[1],
                password: passwordMatch[1].trim(),
                success: true
            };
            console.log('Parsed credentials:', result);
            return result;
        }
        
        // Alternative patterns with better regex
        const altPattern1 = lowerTranscript.match(/username (\w+) password (.+?)(?:\s|$)/);
        if (altPattern1) {
            const result = {
                username: altPattern1[1],
                password: altPattern1[2].trim(),
                success: true
            };
            console.log('Parsed credentials (alt1):', result);
            return result;
        }
        
        const altPattern2 = lowerTranscript.match(/user (\w+) pass (.+?)(?:\s|$)/);
        if (altPattern2) {
            const result = {
                username: altPattern2[1],
                password: altPattern2[2].trim(),
                success: true
            };
            console.log('Parsed credentials (alt2):', result);
            return result;
        }
        
        // More flexible pattern: "login [username] [password]"
        const simplePattern = lowerTranscript.match(/login (\w+) (.+?)(?:\s|$)/);
        if (simplePattern) {
            const result = {
                username: simplePattern[1],
                password: simplePattern[2].trim(),
                success: true
            };
            console.log('Parsed credentials (simple):', result);
            return result;
        }
        
        console.log('Failed to parse voice command');
        return { 
            success: false, 
            message: 'Could not parse voice command. Try saying: "Login as john with password mypassword123" or "Login john mypassword123"' 
        };
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const authMethod = document.querySelector('input[name="authMethod"]:checked').value;
        const transcript = this.transcriptDisplay.textContent.trim();
        let username, password;

        // Handle different authentication methods
        if (authMethod === 'audio-only') {
            // Parse voice command for audio-only authentication
            if (!this.audioBlob) {
                this.showNotification('Please record your voice for authentication', 'error');
                return;
            }

            console.log('Audio-only authentication - transcript:', transcript);
            const voiceCommand = this.parseVoiceCommand(transcript);
            console.log('Voice command result:', voiceCommand);
            
            if (!voiceCommand.success) {
                this.showNotification(voiceCommand.message, 'error');
                return;
            }

            username = voiceCommand.username;
            password = voiceCommand.password;
            
            console.log('Extracted credentials for audio-only:', { username, password });
        } else {
            // Traditional text-based authentication
            username = this.usernameInput.value.trim();
            password = this.passwordInput.value.trim();

            // Basic validation - only check if fields are completely empty
            if (username.length === 0 || password.length === 0) {
                this.showNotification('Please fill in all fields', 'error');
                return;
            }

            // Voice authentication validation
            if (authMethod === 'voice' && !this.audioBlob) {
                this.showNotification('Please record your voice for authentication', 'error');
                return;
            }
        }

        // Show loading state
        this.loginBtn.innerHTML = '<div class="loading"></div> Authenticating...';
        this.loginBtn.disabled = true;

        try {
            // Simulate authentication process
            await this.simulateAuthentication(username, password, authMethod, transcript);
            
            this.showNotification('Login successful! Redirecting to home page...', 'success');
            
            // Set authentication session
            sessionStorage.setItem('authenticated', 'true');
            sessionStorage.setItem('username', username);
            sessionStorage.setItem('authMethod', authMethod);
            
            // Redirect to home page after successful authentication
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);

        } catch (error) {
            console.error('Authentication error:', error);
            this.showNotification('Authentication failed. Please try again.', 'error');
        } finally {
            this.loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            this.loginBtn.disabled = false;
        }
    }

    async simulateAuthentication(username, password, authMethod, transcript) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Relaxed validation for Text Authentication: any non-empty username/password
        if (authMethod === 'text') {
            if (username && password) {
                return { success: true, message: 'Text authentication successful' };
            }
            throw new Error('Please provide username and password');
        }

        // Voice + Text Authentication: require transcript plus non-empty credentials
        if (authMethod === 'voice') {
            const hasVoiceContent = transcript && transcript.length > 10;
            if (!hasVoiceContent) {
                throw new Error('Voice authentication failed - no clear speech detected');
            }

            if (username && password) {
                return { success: true, message: 'Voice + Text authentication successful' };
            }
            throw new Error('Please provide username and password');
        }

        // Audio-Only Authentication: require transcript with parsed credentials
        if (authMethod === 'audio-only') {
            const hasVoiceContent = transcript && transcript.length > 10;
            if (!hasVoiceContent) {
                throw new Error('Audio-only authentication failed - no clear speech detected');
            }

            if (username && password) {
                return { success: true, message: 'Audio-only authentication successful' };
            }
            throw new Error('Could not extract credentials from voice command');
        }

        throw new Error('Invalid authentication method');
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
    new AudioLogin();
});

// Add some utility functions for better user experience
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space bar to start/stop recording
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            const startBtn = document.getElementById('startRecording');
            const stopBtn = document.getElementById('stopRecording');
            
            if (!startBtn.disabled) {
                startBtn.click();
            } else if (!stopBtn.disabled) {
                stopBtn.click();
            }
        }
        
        // Enter to submit form
        if (e.code === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));
        }
    });

    // Add visual feedback for form inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });
});
