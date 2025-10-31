# 🎯 MyVision - AI-Powered Vision Assistance Application

<div align="center">

**An advanced AI-powered vision assistance system designed to help visually impaired individuals navigate their environment safely through voice control and real-time object detection.**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

MyVision combines cutting-edge computer vision models with natural language AI to create an accessible, voice-first interface for navigation assistance. The application uses a cascade of specialized AI models to detect objects, traffic lights, and pedestrian crossings, then generates natural language descriptions to help users understand their surroundings.

### 🎯 Key Objectives

- **Accessibility First**: Voice-controlled interface requiring zero visual interaction
- **Real-Time Processing**: Live camera feed analysis with instant audio feedback
- **Safety Focused**: Prioritizes detection of vehicles, traffic signals, and crossing areas
- **Natural Communication**: AI-generated descriptions using Gemini 1.5 Flash for conversational feedback

---

## ✨ Features

### 🎙️ **Advanced Voice Control**
- **Wake Word Activation**: Hands-free activation with "Hey Vision"
- **Continuous Speech Recognition**: Natural conversation flow with the AI
- **Echo Prevention System**: Multi-layer audio isolation prevents voice feedback loops
- **Contextual Commands**: Smart command interpretation based on current screen

### 🤖 **Multi-Model AI Pipeline**
- **YOLOv8m**: General object detection (80 classes) - vehicles, people, animals, objects
- **Traffic Light Detection**: Specialized model for red, yellow, and green signal recognition
- **Zebra Crossing Detection**: Dedicated pedestrian crossing identification
- **Gemini AI Integration**: Natural language generation for contextual scene descriptions
- **Flan-T5 Fallback**: Local language model when internet unavailable

### 📸 **Multiple Input Modes**
- **Live Camera Detection**: Real-time WebSocket streaming with instant voice feedback
- **Image Upload & Analysis**: Annotated image output with detailed AI descriptions
- **Video Processing**: Frame-by-frame analysis with annotated video output
- **Smart Frame Sampling**: Efficient processing without quality loss

### 🎨 **Modern User Interface**
- **Glassmorphism Design**: Beautiful frosted glass aesthetic with Tailwind CSS
- **Smooth Transitions**: Framer Motion animations for seamless navigation
- **Accessible Components**: shadcn/ui components optimized for screen readers
- **Responsive Layout**: Works on desktop, tablet, and mobile devices

---

## 🎬 Demo

### Voice-Controlled Navigation Flow

1. **Wake Word**: "Hey Vision" → System activates
2. **Login**: Voice username input → PIN entry
3. **Dashboard**: Voice navigation to features
4. **Live Detection**: Real-time camera analysis with audio descriptions
5. **File Upload**: Analyze images/videos with detailed AI feedback

### Sample Voice Descriptions

```
"The traffic light is red. There is 1 car on your left and 2 people on the road. 
A zebra crossing is visible. Please wait before crossing."
```

```
"The traffic light is green. You can see a bench nearby. 
You may proceed with caution."
```

---

## 🚀 Installation

### Prerequisites

- **Python 3.8+** (Backend)
- **Node.js 18+** (Frontend)
- **Git**
- **Gemini API Key** (Optional but recommended - [Get free key](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/Diwakar0212/MyVision.git
cd MyVision
```

### 2. Download AI Models

Download the required YOLO models and place them in `backend/models/`:

| Model | Size | Download |
|-------|------|----------|
| **YOLOv8m** | 52 MB | [Download from Ultralytics](https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8m.pt) |
| **Traffic Lights** | 22 MB | Custom trained model (contact for access) |
| **Zebra Crossing** | 6 MB | Custom trained model (contact for access) |

```bash
# Create models directory
mkdir -p backend/models

# Move downloaded .pt files to backend/models/
# backend/models/yolov8m.pt
# backend/models/traffic_lights.pt
# backend/models/zebra_crossing.pt
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Gemini API Key (optional)
# Edit main.py line 29: GEMINI_API_KEY = "your-api-key-here"

# Start backend server
python main.py
```

Backend runs on **http://localhost:8000**

### 4. Frontend Setup

```bash
# Open new terminal in project root
cd MyVision

# Install Node.js dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on **http://localhost:8080**

### 5. Access the Application

Open your browser and navigate to **http://localhost:8080**

Say **"Hey Vision"** to activate voice control! 🎤

---

## 🎮 Usage Guide

### Voice Commands Reference

#### 🔐 Login & Authentication
- **"Hey Vision"** - Activate voice mode
- Speak your **username** when prompted
- Say your **4-digit PIN** (e.g., "1 2 3 4")

#### 🏠 Dashboard Navigation
- **"Start Camera"** - Begin live detection
- **"Upload File"** - Analyze images/videos
- **"Log Out"** - Exit application

#### 📹 Live Detection
- **"Stop"** - End camera session
- **"Back"** / **"Dashboard"** - Return to main menu

#### 📁 Upload Files
- **"Upload"** - Open file selector
- **"Play"** - Play analyzed video
- **"New"** / **"Another"** - Upload different file

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TS)                     │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────┐ │
│  │   Login    │→ │  Dashboard  │→ │   Live Detection     │ │
│  │  (Voice)   │  │   (Voice)   │  │  (WebSocket)         │ │
│  └────────────┘  └─────────────┘  └──────────────────────┘ │
│         ↓               ↓                    ↓               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Web Speech API (Recognition + Synthesis)      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI + Python)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           4-Model AI Detection Pipeline              │  │
│  │                                                       │  │
│  │  YOLOv8m → Traffic Lights → Zebra Crossing → Gemini │  │
│  │   (80 obj)    (3 colors)      (crossings)   (NLG)   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  OpenCV (Image Processing) + WebSocket (Streaming)   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

#### **Frontend**
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **Framer Motion** - Smooth animations
- **Web Speech API** - Voice recognition & synthesis

#### **Backend**
- **FastAPI** - High-performance async API framework
- **YOLOv8** - State-of-the-art object detection
- **OpenCV** - Computer vision operations
- **Google Gemini 1.5 Flash** - Natural language AI
- **Flan-T5** - Fallback language model
- **WebSockets** - Real-time bidirectional communication

---

## 📦 Project Structure

```
MyVision/
├── backend/
│   ├── main.py                 # FastAPI server with AI pipeline
│   ├── requirements.txt        # Python dependencies
│   ├── models/                 # YOLO model files (.pt)
│   │   ├── yolov8m.pt         # General object detection
│   │   ├── traffic_lights.pt  # Traffic signal detection
│   │   └── zebra_crossing.pt  # Pedestrian crossing detection
│   └── README.md              # Backend documentation
│
├── src/
│   ├── pages/
│   │   ├── Index.tsx          # Splash screen
│   │   ├── Login.tsx          # Voice-activated login
│   │   ├── PinEntry.tsx       # Voice PIN verification
│   │   ├── Dashboard.tsx      # Main navigation hub
│   │   ├── LiveDetection.tsx  # Real-time camera feed
│   │   └── VideoPlayback.tsx  # File upload & analysis
│   │
│   ├── hooks/
│   │   ├── useAdvancedVoice.ts # Voice control with echo prevention
│   │   └── useVoice.ts         # Simple voice hook
│   │
│   ├── components/
│   │   ├── NavigationBar.tsx   # Top navigation
│   │   ├── QuickNav.tsx        # Quick action buttons
│   │   └── ui/                 # shadcn/ui components (60+)
│   │
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # Application entry point
│
├── public/                     # Static assets
├── package.json                # Node.js dependencies
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── README.md                   # This file
```

---

## 🔧 Configuration

### Gemini API Key Setup

Edit `backend/main.py` line 29:

```python
GEMINI_API_KEY = "your-gemini-api-key-here"
```

Get your free API key at [Google AI Studio](https://makersuite.google.com/app/apikey)

### Detection Confidence Threshold

Adjust sensitivity in `backend/main.py`:

```python
conf_threshold = 0.4  # Range: 0.0 (detect everything) to 1.0 (very strict)
```

### Voice Recognition Language

Edit `src/hooks/useAdvancedVoice.ts`:

```typescript
recognition.lang = 'en-US';  // Change to your language code
```

Supported languages: `en-US`, `en-GB`, `es-ES`, `fr-FR`, `de-DE`, etc.

---

## 🌐 API Endpoints

### REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API status and available endpoints |
| `/health` | GET | Health check and model status |
| `/api/detect` | POST | Auto-detect image/video and process |
| `/api/detect/image` | POST | Analyze uploaded image |
| `/api/detect/video` | POST | Process and annotate video |

### WebSocket

| Endpoint | Protocol | Description |
|----------|----------|-------------|
| `/api/detect/live` | WebSocket | Real-time camera frame streaming |

### Example Request

```bash
curl -X POST "http://localhost:8000/api/detect" \
  -F "file=@image.jpg" \
  -F "confidence=0.4"
```

### Example Response

```json
{
  "success": true,
  "type": "image",
  "filename": "street_scene.jpg",
  "detections": {
    "objects": [
      {"label": "car", "confidence": 0.89, "bbox": [120, 200, 450, 600]},
      {"label": "person", "confidence": 0.92, "bbox": [500, 150, 650, 700]}
    ],
    "traffic_lights": [
      {"label": "red", "confidence": 0.95, "bbox": [300, 50, 350, 120]}
    ],
    "zebra_crossings": [
      {"label": "zebra_crossing", "confidence": 0.88, "bbox": [0, 600, 800, 800]}
    ]
  },
  "counts": {
    "total_objects": 2,
    "traffic_lights": 1,
    "zebra_crossings": 1
  },
  "voice_description": "The traffic light is red. There is 1 car on your left and 1 person on the road. A zebra crossing is visible. Please wait before crossing.",
  "annotated_image": "data:image/jpeg;base64,..."
}
```

---

## 🐛 Troubleshooting

### Models Not Loading

**Problem**: Backend shows "Models not loaded" error

**Solutions**:
- Verify `.pt` files exist in `backend/models/`
- Check file permissions (read access required)
- Ensure correct file names: `yolov8m.pt`, `traffic_lights.pt`, `zebra_crossing.pt`
- Run `python check_models.py` to diagnose

### Voice Recognition Not Working

**Problem**: Voice commands not detected

**Solutions**:
- Allow microphone permissions in browser
- Use Chrome or Edge (best Web Speech API support)
- Check browser console for errors (F12)
- Test microphone with other apps
- Ensure you're saying "Hey Vision" clearly

### Backend Connection Failed

**Problem**: Frontend can't reach backend API

**Solutions**:
- Verify backend is running on `http://localhost:8000`
- Check firewall settings
- Verify CORS configuration in `main.py`
- Restart both frontend and backend servers

### Echo/Voice Feedback Loop

**Problem**: App captures its own speech

**Solutions**:
- Use headphones/earbuds instead of speakers
- Already implemented: 1100ms delay system prevents most echoes
- Check browser console for `🚫 BLOCKED` messages
- Reduce system volume if issue persists

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **🐛 Report Bugs**: Open an issue with detailed steps to reproduce
2. **💡 Suggest Features**: Share your ideas for improvements
3. **📝 Improve Documentation**: Fix typos, add examples, clarify instructions
4. **🔧 Submit Code**: Create pull requests with bug fixes or new features
5. **🌍 Translations**: Help translate the interface to other languages

### Development Workflow

```bash
# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/MyVision.git

# 3. Create a feature branch
git checkout -b feature/amazing-feature

# 4. Make your changes and commit
git commit -m "Add amazing feature"

# 5. Push to your fork
git push origin feature/amazing-feature

# 6. Open a Pull Request
```

### Code Style

- **Python**: Follow PEP 8 style guide
- **TypeScript/React**: Use ESLint configuration provided
- **Commits**: Use conventional commit messages (feat, fix, docs, etc.)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Diwakar**

- GitHub: [@Diwakar0212](https://github.com/Diwakar0212)
- Repository: [MyVision](https://github.com/Diwakar0212/MyVision)

---

## 🙏 Acknowledgments

- **[Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)** - Exceptional object detection framework
- **[Google Gemini AI](https://deepmind.google/technologies/gemini/)** - Advanced natural language generation
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern, high-performance Python web framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful and accessible React components
- **Web Speech API Community** - For excellent browser speech capabilities

---

## 🚧 Roadmap

### Planned Features

- [ ] **Multi-language Support**: Interface and voice in 10+ languages
- [ ] **Mobile Applications**: iOS and Android native apps
- [ ] **Offline Mode**: Run models locally without internet
- [ ] **GPS Integration**: Outdoor navigation with turn-by-turn directions
- [ ] **Social Features**: Share safe routes and landmarks
- [ ] **Custom Model Training**: User-specific object detection
- [ ] **Wearable Device Support**: Smart glasses integration
- [ ] **Voice Customization**: Choose voice speed, pitch, and language
- [ ] **Community Database**: Crowdsourced accessibility information

---

## 📊 Statistics

- **Languages**: Python, TypeScript, JavaScript, CSS
- **Components**: 60+ reusable UI components
- **AI Models**: 3 YOLO + 1 Gemini + 1 Flan-T5
- **API Endpoints**: 4 REST + 1 WebSocket
- **Lines of Code**: 21,000+
- **Dependencies**: 45+ packages

---

## 💬 Support

### Get Help

- **📖 Documentation**: Check our detailed guides in the `/docs` folder
- **🐛 Issues**: [Report bugs or request features](https://github.com/Diwakar0212/MyVision/issues)
- **💬 Discussions**: [Ask questions and share ideas](https://github.com/Diwakar0212/MyVision/discussions)

### Show Your Support

If you find MyVision helpful:

- ⭐ **Star** this repository
- 🍴 **Fork** to contribute
- 🐦 **Share** on social media
- 📝 **Write** a blog post or tutorial

---

<div align="center">

**Made with ❤️ for accessibility and inclusion**

*Empowering visually impaired individuals with AI technology*

</div>
