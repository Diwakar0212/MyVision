# Multi-Modal Authentication System

A complete authentication system with text, voice, and video authentication capabilities across multiple pages.

## Features

### Login Page (index.html)
- **Dual Authentication**: Choose between text or voice authentication
- **Voice Recording**: Record audio using your device's microphone
- **Speech Recognition**: Real-time speech-to-text transcription
- **Modern UI**: Beautiful, responsive design with gradient backgrounds
- **Form Validation**: Complete form validation with user feedback
- **Audio Playback**: Play back recorded audio for verification
- **Keyboard Shortcuts**: Space bar to start/stop recording, Ctrl+Enter to submit

### Home Page (home.html)
- **Video Authentication**: Complete video-based identity verification
- **Face Detection**: Real-time face detection and positioning guidance
- **Photo Capture**: High-quality photo capture for verification
- **Multi-step Verification**: Face detection, face matching, and liveness checks
- **Session Management**: Secure session handling with logout functionality
- **Dashboard Access**: Complete authentication flow to dashboard

## Demo Credentials

For testing purposes, use these credentials:
- Username: `admin`, Password: `password123`
- Username: `user`, Password: `user123`
- Username: `demo`, Password: `demo123`

## How to Use

### Step 1: Login Authentication
1. **Open the Application**: Open `index.html` in a modern web browser
2. **Enter Credentials**: Fill in your username and password
3. **Choose Authentication Method**:
   - **Text Authentication**: Simply click "Login" after entering credentials
   - **Voice Authentication**: Click "Start Recording", speak clearly, then "Login"
4. **Complete Login**: The system will authenticate and redirect to the home page

### Step 2: Video Authentication
1. **Access Home Page**: After successful login, you'll be redirected to `home.html`
2. **Start Video**: Click "Start Video" to access your camera
3. **Position Face**: Follow the instructions to position your face in the center
4. **Capture Photo**: Click "Capture Photo" when your face is detected
5. **Verify Identity**: Click "Verify Identity" to complete video authentication
6. **Access Dashboard**: Once verified, click "Go to Dashboard" for full access

## Browser Requirements

- **Chrome/Edge**: Full support for speech recognition and audio recording
- **Firefox**: Good support for audio recording, limited speech recognition
- **Safari**: Basic support, may require HTTPS for microphone access

## Technical Features

### Audio Recording
- Uses Web Audio API for high-quality recording
- Echo cancellation and noise suppression
- 44.1kHz sample rate for clear audio

### Speech Recognition
- Real-time transcription using Web Speech API
- Continuous listening with interim results
- Error handling for recognition failures

### Security Features
- Client-side validation
- Audio blob verification
- Simulated authentication process

## File Structure

```
├── index.html          # Login page with text/voice authentication
├── home.html           # Home page with video authentication
├── styles.css          # CSS styling for login page
├── home-styles.css     # CSS styling for home page
├── script.js           # JavaScript for login functionality
├── home-script.js      # JavaScript for video authentication
└── README.md          # This documentation
```

## Customization

### Styling
- Modify `styles.css` to change colors, fonts, or layout
- Update gradient backgrounds in the CSS variables
- Adjust responsive breakpoints as needed

### Functionality
- Edit `script.js` to modify authentication logic
- Add new validation rules in the `handleLogin` method
- Customize speech recognition settings

### Authentication
- Replace the `simulateAuthentication` method with real API calls
- Add server-side voice verification
- Implement proper user management

## Browser Permissions

The application requires:
- **Microphone Access**: For audio recording and speech recognition
- **HTTPS**: Required for microphone access in production

## Troubleshooting

### Microphone Not Working
- Ensure browser has microphone permissions
- Check if microphone is being used by another application
- Try refreshing the page and granting permissions again

### Speech Recognition Issues
- Speak clearly and at normal volume
- Ensure you're in a quiet environment
- Check browser compatibility (Chrome/Edge work best)

### Audio Playback Problems
- Verify audio is recorded successfully
- Check browser audio settings
- Ensure no other audio is blocking playback

## Future Enhancements

- Server-side voice authentication
- Voice biometric verification
- Multi-language support
- Advanced audio processing
- User voice profile management

## License

This project is open source and available under the MIT License.
