# GitHub Copilot Instructions for MyVision

## Project Overview

**MyVision** is an AI-powered vision assistance application designed to help visually impaired users navigate their environment. The system uses multiple YOLO models to detect objects, traffic lights, and zebra crossings, providing real-time voice descriptions and visual annotations.

### Core Architecture

```
MyVision (Monorepo)
├── Frontend (React + TypeScript + Vite)
│   ├── Voice-controlled UI with authentication
│   ├── Live camera detection
│   └── Video/image upload and playback
│
└── Backend (FastAPI + Python)
    ├── REST API endpoints
    ├── WebSocket for live detection
    └── 3-model YOLO cascade detection system
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite (build tool)
- shadcn-ui components
- Tailwind CSS
- React Router v6
- TanStack Query (React Query)
- Web Speech API (voice recognition & synthesis)
- Framer Motion (animations)

**Backend:**
- FastAPI 0.115.0
- Ultralytics YOLOv8 (>=8.3.0)
- PyTorch (>=2.1.0) & torchvision (>=0.16.0)
- OpenCV 4.10.0
- Pillow 10.4.0
- NumPy >=1.26.0
- python-multipart (file uploads)

---

## Project Structure

### Important: Nested Directory Structure

The project has a nested structure that can cause confusion:

```
C:\Users\diwakar\Downloads\syn-vision-main (1)\
└── syn-vision-main\                    ← ACTUAL PROJECT ROOT
    ├── backend\                        ← Backend API
    │   ├── models\                     ← Model files (.pt)
    │   │   ├── yolov8m.pt
    │   │   ├── traffic_lights.pt
    │   │   └── zebra_crossing.pt
    │   ├── main.py                     ← FastAPI server
    │   ├── requirements.txt
    │   └── README.md
    │
    ├── src\                            ← React frontend
    │   ├── App.tsx                     ← Main app with routing
    │   ├── main.tsx                    ← Entry point
    │   ├── components\                 ← UI components
    │   │   ├── ui\                     ← shadcn-ui components
    │   │   └── NavigationBar.tsx
    │   ├── hooks\                      ← React hooks
    │   │   ├── useVoice.ts            ← Voice recognition/synthesis
    │   │   └── useAdvancedVoice.ts
    │   ├── pages\                      ← Route pages
    │   │   ├── Index.tsx
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx
    │   │   ├── LiveDetection.tsx
    │   │   └── VideoPlayback.tsx
    │   └── lib\
    │       └── utils.ts
    │
    ├── public\                         ← Static assets
    ├── .github\                        ← GitHub config
    │   └── copilot-instructions.md     ← This file
    ├── start_backend.py                ← Quick start script
    ├── package.json                    ← Frontend dependencies
    ├── vite.config.ts                  ← Vite configuration
    ├── tailwind.config.ts              ← Tailwind configuration
    └── tsconfig.json                   ← TypeScript config
```

**⚠️ Always use the inner `syn-vision-main` folder as the project root!**

---

## Backend Architecture

### Multi-Model Detection Pipeline

The backend uses a **3-model cascade detection system** that runs sequentially on every frame:

```
Input Image/Frame
    ↓
┌─────────────────────────────────────────┐
│ Step 1: YOLOv8m (General Objects)      │
│ - Detects: 80 object classes           │
│ - Excludes: Class 9 (traffic lights)   │
│ - Purpose: Cars, people, bikes, etc.   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Step 2: Traffic Lights (Custom Model)  │
│ - Detects: Red, Green, Yellow lights   │
│ - Classes: 2, 3, 4                     │
│ - Purpose: Traffic signal detection     │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Step 3: Zebra Crossing (Custom Model)  │
│ - Detects: Pedestrian crossings        │
│ - Class: 8                             │
│ - Purpose: Safe crossing points         │
└─────────────────────────────────────────┘
    ↓
Merge Results + Annotate + Generate Voice Description
    ↓
Return Combined Results
```

### Model Manager Pattern

**File:** `backend/main.py`

```python
class ModelManager:
    """Manages loading and execution of all 3 YOLO models"""
    
    def __init__(self):
        self.model_yolo = None       # YOLOv8m base model
        self.model_lights = None     # Traffic lights model
        self.model_zebra = None      # Zebra crossing model
        self.models_loaded = False
    
    def load_models(self):
        """Load all 3 models from backend/models/ directory"""
        # Loads: yolov8m.pt, traffic_lights.pt, zebra_crossing.pt
        # Sets self.models_loaded = True if all succeed
    
    def detect_all(self, image: np.ndarray, conf_threshold: float = 0.4):
        """Run all 3 models sequentially and combine results"""
        # Returns dict with: objects, traffic_lights, zebra_crossings, annotated_image
```

**Critical Convention:**
- All model files MUST be in `backend/models/` directory
- Model loading paths MUST be relative to project root: `'backend/models/yolov8m.pt'`
- Always check `model_manager.models_loaded` before processing

### API Endpoints

#### 1. Health Check
```
GET /health
```
Returns model loading status.

#### 2. Unified Detection (Recommended)
```
POST /api/detect
```
- Auto-detects file type (image or video)
- Parameters:
  - `file`: Image or video file
  - `confidence`: Float (0.0-1.0, default: 0.4)
  - `sample_rate`: Int (video only, default: 5)
- Response includes `type` field: `"image"` or `"video"`

#### 3. Image Detection
```
POST /api/detect/image
```
- For explicit image processing
- Returns base64-encoded annotated image

#### 4. Video Detection
```
POST /api/detect/video
```
- Frame-by-frame processing with memory optimization
- Returns base64-encoded annotated video
- Parameters:
  - `sample_rate`: Process every Nth frame (default: 5)
  - Higher `sample_rate` = faster processing, fewer detections

#### 5. Live Detection (WebSocket)
```
WS /api/detect/live
```
- Real-time camera feed processing
- Client sends base64-encoded frames
- Server returns detections + voice description

### API Response Structure

**Image Response:**
```json
{
  "success": true,
  "type": "image",
  "filename": "test.jpg",
  "detections": {
    "objects": [
      {
        "bbox": [x1, y1, x2, y2],
        "confidence": 0.85,
        "class_id": 2,
        "label": "car"
      }
    ],
    "traffic_lights": [...],
    "zebra_crossings": [...]
  },
  "counts": {
    "total_objects": 3,
    "traffic_lights": 1,
    "zebra_crossings": 0
  },
  "voice_description": "I see 2 cars, 1 person. Red traffic light ahead, please stop.",
  "annotated_image": "data:image/jpeg;base64,/9j/4AAQ..."
}
```

**Video Response:**
```json
{
  "success": true,
  "type": "video",
  "filename": "test.mp4",
  "detections": {
    "objects": [...],        // Aggregated across all frames
    "traffic_lights": [...],
    "zebra_crossings": [...]
  },
  "video_info": {
    "total_frames": 150,
    "processed_frames": 30,
    "fps": 30.0,
    "duration": 5.0
  },
  "counts": {...},
  "voice_description": "Video analysis: 5 cars, 3 people detected...",
  "annotated_video": "data:video/mp4;base64,AAAAIGZ0eXBpc29t..."
}
```

### Memory Management Patterns

**Video Processing:**
```python
# Garbage collection every 100 frames
if frame_count % 100 == 0:
    gc.collect()

# Always cleanup temporary files in finally block
finally:
    try:
        if temp_input and os.path.exists(temp_input.name):
            os.unlink(temp_input.name)
        if temp_output and os.path.exists(temp_output.name):
            os.unlink(temp_output.name)
    except Exception as cleanup_error:
        print(f"⚠️ Cleanup warning: {cleanup_error}")
```

**Key Practices:**
1. Use `tempfile` for video processing
2. Force garbage collection every 100 frames
3. Release frames with `del` after processing
4. Always cleanup in `finally` blocks
5. Use `sample_rate` to control processing load

### Voice Description Generation

**File:** `backend/main.py` - `generate_voice_description()`

```python
def generate_voice_description(detections: Dict) -> str:
    """Generate natural language description from detections"""
    # Creates human-friendly descriptions like:
    # "I see 2 cars, 1 person. Red traffic light ahead, please stop."
    # "Green traffic light, you can go. Zebra crossing detected ahead."
```

**Pattern:**
- Count all detected objects
- Prioritize safety information (traffic lights, crossings)
- Use clear, concise language
- Always mention traffic light status and action (stop/go)

---

## Frontend Architecture

### Routing Structure

**File:** `src/App.tsx`

```tsx
<Routes>
  <Route path="/" element={<Index />} />
  <Route path="/login" element={<Login />} />
  <Route path="/pin" element={<PinEntry />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/live-detection" element={<LiveDetection />} />
  <Route path="/video-playback" element={<VideoPlayback />} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

### State Management

**App-Level State:**
- `username`: Current user's name
- `isAuthenticated`: Authentication status
- `isVoiceModeActive`: Voice control mode flag

**Passed via props to all pages for voice control integration**

### Voice Control System

**Hook:** `src/hooks/useVoice.ts`

```typescript
export const useVoice = () => {
  const speak = (text: string) => { /* Text-to-speech */ };
  const startListening = (onResult: (text: string) => void, options?: {
    continuous?: boolean;
    interimResults?: boolean;
  }) => { /* Speech recognition */ };
  const stopListening = () => { /* Stop recognition */ };
  
  return { speak, startListening, stopListening, state };
};
```

**Usage Pattern:**
```tsx
const { speak, startListening } = useVoice();

// Speak to user
speak("Welcome to live detection mode");

// Listen for commands
startListening((transcript) => {
  if (transcript.includes("start camera")) {
    startCamera();
  }
}, { continuous: true });
```

### Detection Integration Pattern

**File:** `src/pages/VideoPlayback.tsx`

```tsx
const detectObjects = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('confidence', confidence.toString());
  
  const response = await fetch('http://localhost:8000/api/detect', {
    method: 'POST',
    body: formData
  });
  
  const data = await response.json();
  
  // Display annotated media
  if (data.type === 'image') {
    setImageSrc(data.annotated_image);
  } else if (data.type === 'video') {
    setVideoSrc(data.annotated_video);
  }
  
  // Speak results
  speak(data.voice_description);
  
  // Display detection statistics
  setDetections(data.detections);
  setCounts(data.counts);
};
```

### UI Component Patterns

**shadcn-ui Usage:**
- All UI components are in `src/components/ui/`
- Import from `@/components/ui/button`, etc.
- Consistent styling via Tailwind classes
- Glass morphism theme for modern look

**Custom Components:**
- `NavigationBar`: Top navigation with voice mode indicator
- `ListeningIndicator`: Visual feedback for voice recognition
- `GlassCard`: Reusable card component with glass effect
- `QuickNav`: Quick navigation shortcuts
- `ControlsHelper`: Help overlay for voice commands

---

## Development Workflows

### Starting the Project

**Backend:**
```powershell
# Navigate to project root (inner syn-vision-main folder)
cd "C:\Users\diwakar\Downloads\syn-vision-main (1)\syn-vision-main"

# Option 1: Quick start (recommended)
python start_backend.py

# Option 2: Direct uvicorn
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```powershell
# From project root
npm install   # First time only
npm run dev   # Start dev server on http://localhost:5173
```

### Adding/Updating Models

**Location:** `backend/models/`

**Required Files:**
1. `yolov8m.pt` - YOLOv8m base model (auto-downloads if missing)
2. `traffic_lights.pt` - Custom traffic light model
3. `zebra_crossing.pt` - Custom zebra crossing model

**Model Loading Code:** `backend/main.py` lines 33-58

```python
self.model_yolo = YOLO('backend/models/yolov8m.pt')
self.model_lights = YOLO('backend/models/traffic_lights.pt')
self.model_zebra = YOLO('backend/models/zebra_crossing.pt')
```

**Verification:**
```powershell
# Check health endpoint
curl http://localhost:8000/health

# Should return:
# {"status": "healthy", "models": {"yolov8m": true, "traffic_lights": true, "zebra_crossing": true}}
```

### Testing Workflows

**Health Check:**
```powershell
curl http://localhost:8000/health
```

**Image Detection:**
```powershell
curl -X POST "http://localhost:8000/api/detect" `
  -F "file=@test_image.jpg" `
  -F "confidence=0.5"
```

**Video Detection:**
```powershell
curl -X POST "http://localhost:8000/api/detect" `
  -F "file=@test_video.mp4" `
  -F "confidence=0.4" `
  -F "sample_rate=5"
```

**Interactive Testing:**
```powershell
# Use test script
cd backend
python test_api.py

# Or use API docs
# Visit: http://localhost:8000/docs
```

### Adding New Detection Features

**Backend Steps:**
1. Add new model to `backend/models/`
2. Update `ModelManager.__init__()` to include new model
3. Update `ModelManager.load_models()` to load new model
4. Update `ModelManager.detect_all()` to run new model
5. Update voice description logic in `generate_voice_description()`
6. Update health check endpoint to include new model

**Frontend Steps:**
1. Update `Detection` interface types if needed
2. Update display logic in relevant pages
3. Add new voice descriptions/commands
4. Update UI to show new detection types

---

## Code Conventions

### File Naming

**Backend (Python):**
- Lowercase with underscores: `main.py`, `test_api.py`
- Model files: `model_name.pt`

**Frontend (TypeScript/React):**
- PascalCase for components: `LiveDetection.tsx`, `NavigationBar.tsx`
- camelCase for hooks: `useVoice.ts`, `useAdvancedVoice.ts`
- kebab-case for shadcn-ui: `button.tsx`, `use-toast.ts`

### Import Paths

**Frontend:**
```tsx
// Absolute imports using @ alias (configured in vite.config.ts)
import { Button } from "@/components/ui/button";
import { useVoice } from "@/hooks/useVoice";
import { cn } from "@/lib/utils";
```

**Backend:**
```python
# Standard library first, then third-party, then local
from fastapi import FastAPI, File, UploadFile
from ultralytics import YOLO
import cv2
import numpy as np
```

### Styling Conventions

**Tailwind CSS:**
- Use utility classes directly in JSX
- Glass morphism theme: `backdrop-blur-xl`, `bg-white/10`
- Consistent spacing: `space-y-4`, `gap-6`, `p-8`
- Responsive design: `md:flex-row`, `lg:w-1/2`

**Color Scheme:**
- Background: `bg-gradient-to-br from-blue-50 to-indigo-100`
- Primary: Indigo/blue tones
- Accent: Purple/pink tones
- Glass cards: White with low opacity and backdrop blur

### Error Handling

**Backend:**
```python
try:
    # Processing logic
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"error": str(e)}
    )
finally:
    # Cleanup logic (always runs)
```

**Frontend:**
```tsx
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  // Success handling
} catch (error) {
  console.error('Detection failed:', error);
  speak('Detection failed. Please try again.');
  // User feedback
}
```

### Logging Conventions

**Backend:**
```python
# Use emojis for visual clarity in console
print("🚀 Starting MyVision API Server")
print("✅ All models loaded successfully!")
print("⚠️ WARNING: Model not found")
print("❌ Error: Failed to process frame")
print("📸 Processing image: filename.jpg")
print("🎥 Processing video: filename.mp4")
print("⚙️ Running YOLOv8m...")
```

**Frontend:**
```typescript
console.log('Speech recognition initialized');
console.log('Detection complete:', data);
console.error('Camera access denied:', error);
console.warn('Models not fully loaded');
```

---

## Integration Points

### Backend ↔ Frontend Communication

**CORS Configuration:** `backend/main.py`
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:8085"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**API Base URL:** `http://localhost:8000` (hardcoded in frontend)

**WebSocket Connection:**
```javascript
const ws = new WebSocket('ws://localhost:8000/api/detect/live');

// Send frame
ws.send(frameBase64);

// Receive results
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Process detections
};
```

### File Upload Pattern

**Frontend:**
```tsx
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('confidence', '0.5');
formData.append('sample_rate', '5'); // For videos

const response = await fetch('http://localhost:8000/api/detect', {
  method: 'POST',
  body: formData
});
```

**Backend:**
```python
@app.post("/api/detect")
async def detect_objects(
    file: UploadFile = File(...),
    confidence: float = 0.4,
    sample_rate: int = 5
):
    # Auto-detect file type from extension
    # Process accordingly
    # Return unified response
```

### Voice Integration Pattern

**Speak on Detection:**
```tsx
const response = await fetch('/api/detect', {...});
const data = await response.json();

if (data.voice_description) {
  speak(data.voice_description);
}
```

**Voice Commands:**
```tsx
startListening((transcript) => {
  const command = transcript.toLowerCase();
  
  if (command.includes('start camera')) {
    startCamera();
  } else if (command.includes('stop')) {
    stopCamera();
  } else if (command.includes('back') || command.includes('return')) {
    navigate('/dashboard');
  }
}, { continuous: true });
```

---

## Best Practices

### Performance Optimization

1. **Video Processing:**
   - Use `sample_rate` to control frame processing (default: 5)
   - Higher `sample_rate` = faster processing, fewer detections
   - Force garbage collection every 100 frames
   - Always cleanup temporary files

2. **Image Processing:**
   - Direct processing, no sampling needed
   - Instant results for better UX

3. **Live Detection:**
   - Use WebSocket for continuous streaming
   - Throttle frame sending to avoid overload
   - Process every 2-3 seconds for balance

### Accessibility

1. **Voice Feedback:**
   - Always speak important information
   - Use clear, concise language
   - Prioritize safety information (traffic lights, obstacles)
   - Confirm user actions verbally

2. **UI Design:**
   - Large, high-contrast buttons
   - Clear visual indicators for voice mode
   - Loading states for all async operations
   - Error messages with voice feedback

### Security

1. **File Upload Validation:**
   - Check file extensions
   - Validate file size
   - Use temporary files for processing
   - Clean up after processing

2. **API Security:**
   - Validate confidence thresholds (0.0-1.0)
   - Limit sample_rate range (1-30)
   - Handle invalid files gracefully
   - Return appropriate HTTP status codes

### Testing

1. **Backend Testing:**
   - Use `test_api.py` for interactive testing
   - Test health endpoint before processing
   - Verify all 3 models are loaded
   - Test with various image/video formats

2. **Frontend Testing:**
   - Test voice recognition in supported browsers
   - Verify camera permissions
   - Test file upload with various formats
   - Verify responsive design on mobile

---

## Common Issues & Solutions

### Issue: Models Not Loading

**Symptoms:**
- Health endpoint returns `"status": "models_not_loaded"`
- Detection requests return 503 errors

**Solutions:**
1. Verify all 3 models exist in `backend/models/`
2. Check file permissions
3. Verify paths are relative to project root: `backend/models/model.pt`
4. Check server logs for detailed error messages

### Issue: "Port 8000 already in use"

**Solutions:**
```powershell
# Option 1: Kill existing process
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Option 2: Use different port
# In main.py, change port:
uvicorn.run(app, port=8001)
```

### Issue: CORS Errors

**Symptoms:**
- "CORS policy" errors in browser console
- Fetch requests failing from frontend

**Solutions:**
1. Verify frontend URL in CORS origins list
2. Ensure backend server is running
3. Check if credentials mode is needed
4. Verify request headers

### Issue: Video Processing Out of Memory

**Solutions:**
1. Increase `sample_rate` (process fewer frames)
2. Reduce video resolution before processing
3. Ensure garbage collection is active
4. Verify temporary file cleanup
5. Monitor system resources during processing

### Issue: Voice Recognition Not Working

**Symptoms:**
- No transcript captured
- "Speech recognition not supported" error

**Solutions:**
1. Use Chrome/Edge (best support)
2. Ensure HTTPS or localhost (required for security)
3. Grant microphone permissions
4. Check browser console for errors
5. Verify Web Speech API availability

---

## Development Tips

### When Adding New Features

1. **Backend First:**
   - Define API endpoint
   - Implement processing logic
   - Add error handling
   - Test with curl/test_api.py
   - Update API documentation

2. **Frontend Second:**
   - Create/update TypeScript interfaces
   - Implement API integration
   - Add voice feedback
   - Update UI components
   - Test user flow

### When Debugging

1. **Backend:**
   - Check server logs (emoji indicators help!)
   - Test endpoints with curl
   - Verify model loading at startup
   - Use print statements liberally
   - Check `backend/test_api.py` for examples

2. **Frontend:**
   - Check browser console
   - Verify network requests in DevTools
   - Test voice features in isolation
   - Verify state management flow
   - Check component prop drilling

### When Modifying Detection Logic

1. Update `ModelManager.detect_all()` method
2. Update response types/interfaces
3. Update voice description generation
4. Update frontend TypeScript interfaces
5. Test with various input types
6. Update documentation

---

## Documentation Files

**Key Documentation:**
- `README.md` - Project overview (Lovable.dev info)
- `backend/README.md` - Backend setup and API docs
- `backend/VIDEO_SUPPORT.md` - Video processing documentation
- `START_HERE.md` - Quick start guide for new developers
- `BACKEND_QUICK_START.md` - Backend quick reference
- `QUICK_REFERENCE.md` - API quick reference
- `UPDATE_SUMMARY.md` - Recent feature changes
- `ADD_MODELS_HERE.md` - Instructions for adding models

**When to Update:**
- Add new feature → Update relevant docs
- Change API → Update API docs + examples
- Fix bug → Update troubleshooting section
- Change setup → Update quick start guides

---

## Quick Command Reference

### Development

```powershell
# Start backend
python start_backend.py

# Start frontend
npm run dev

# Test API
cd backend; python test_api.py

# Check models
curl http://localhost:8000/health

# View API docs
# Navigate to: http://localhost:8000/docs
```

### Building

```powershell
# Frontend build
npm run build

# Frontend preview
npm run preview

# Type checking
npm run type-check  # if available
```

### Dependencies

```powershell
# Install backend deps
pip install -r backend/requirements.txt

# Install frontend deps
npm install

# Update dependencies
pip install --upgrade -r backend/requirements.txt
npm update
```

---

## AI Coding Assistant Guidance

### When Working on This Project

1. **Always verify the nested directory structure** before executing commands
2. **Check if backend server is running** before testing frontend features
3. **Verify all 3 models are loaded** (check `/health`) before processing
4. **Use relative paths from project root** for all file operations
5. **Follow existing code patterns** (see conventions above)
6. **Add voice feedback** for all user actions (accessibility requirement)
7. **Handle errors gracefully** with user-friendly messages
8. **Test with both images and videos** when modifying detection logic
9. **Update documentation** when making significant changes
10. **Use emoji indicators** in console logs for visual clarity

### Preferred Patterns

**Backend:**
- Use FastAPI's dependency injection
- Handle files with `UploadFile` from FastAPI
- Use `tempfile` for temporary storage
- Force garbage collection for large operations
- Always cleanup in `finally` blocks
- Return structured JSON responses
- Log progress with emoji indicators

**Frontend:**
- Use React hooks for state management
- Implement error boundaries where appropriate
- Use shadcn-ui components for UI
- Implement voice feedback for all actions
- Use TypeScript strictly (no `any` types)
- Handle loading states visually
- Provide clear user feedback

---

## Version Information

**Last Updated:** December 2024

**Key Dependencies:**
- FastAPI: 0.115.0
- Ultralytics: >=8.3.0
- React: 18.x
- Vite: Latest
- TypeScript: 5.x

**Server Info:**
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- WebSocket: ws://localhost:8000/api/detect/live

---

## Contact & Support

For questions about this codebase:
1. Check the documentation files listed above
2. Review API documentation at http://localhost:8000/docs
3. Test endpoints with `backend/test_api.py`
4. Review existing code patterns in this file

**Project Origin:** Built with Lovable.dev (https://lovable.dev)

---

**Remember:** This is a vision assistance application. Accessibility, voice feedback, and reliable detection are top priorities. Always test features from the perspective of a visually impaired user.
