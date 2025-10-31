# MyVision FastAPI Backend

Backend server for MyVision - AI-powered vision assistance application.

## 📁 Folder Structure

```
backend/
├── main.py              # FastAPI server
├── requirements.txt     # Python dependencies
├── README.md           # This file
└── models/             # Your trained models (CREATE THIS FOLDER)
    ├── yolov8m.pt             # YOLOv8m base model
    ├── traffic_lights.pt      # Your traffic light detection model
    └── zebra_crossing.pt      # Your zebra crossing detection model
```

## 🚀 Setup Instructions

### Step 1: AI Models (Already Included! ✅)

**Good News:** All 3 AI models are now included in the repository via Git LFS and should already be in `backend/models/` folder after cloning.

```bash
# Verify models are present
ls backend/models/*.pt

# If models are missing, pull them via Git LFS:
git lfs pull
```

You should see:
- ✅ `yolov8m.pt` (52 MB) - General object detection
- ✅ `traffic_lights.pt` (22 MB) - Traffic signal detection  
- ✅ `zebra_crossing.pt` (6 MB) - Pedestrian crossing detection

📚 **For detailed model info:** See [models/README.md](models/README.md)

### Step 2: Configure API Key (Optional but Recommended)

Set up your Gemini API key for advanced AI voice descriptions:

```bash
# Navigate to backend folder
cd backend

# Copy the example .env file
cp .env.example .env

# Edit .env and add your Gemini API key
# Get free key at: https://makersuite.google.com/app/apikey
```

Edit `.env`:
```bash
GEMINI_API_KEY=your-actual-api-key-here
```

**Note:** The app works without Gemini (uses Flan-T5 fallback), but Gemini provides more natural voice descriptions.

### Step 3: Install Python dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI (web framework)
- Uvicorn (ASGI server)
- OpenCV (image processing)
- Ultralytics (YOLO models)
- PyTorch (deep learning)
- And other dependencies

### Step 3: Run the server

```bash
python main.py
```

Or use uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: **http://localhost:8000**

## 📡 API Endpoints

### 1. Health Check
```
GET /health
```
Check if all models are loaded correctly.

### 2. Image Detection
```
POST /api/detect/image
```
Upload an image and get detections from all 3 models.

**Request:**
- Form-data with `file` (image file)
- Optional: `confidence` (float, default: 0.4)

**Response:**
```json
{
  "success": true,
  "detections": {
    "objects": [...],           // Cars, people, etc.
    "traffic_lights": [...],    // Red/green/yellow lights
    "zebra_crossings": [...]    // Zebra crossings
  },
  "voice_description": "I see 2 cars, 1 person. Red traffic light ahead, please stop.",
  "annotated_image": "data:image/jpeg;base64,..."
}
```

### 3. Video Analysis
```
POST /api/detect/video
```
Upload a video and get frame-by-frame analysis.

### 4. Live Detection (WebSocket)
```
WS /api/detect/live
```
Real-time camera feed detection.

## 🤖 How It Works

The backend uses **3 YOLO models** in sequence (exactly like your Colab code):

1. **YOLOv8m** - Detects cars, people, bikes, etc. (excludes traffic lights)
2. **Traffic Light Model** - Detects red, green, yellow lights
3. **Zebra Crossing Model** - Detects zebra crossings

Each model's detections are merged into a final annotated image.

## 🔧 Testing the API

### Test with curl:
```bash
# Health check
curl http://localhost:8000/health

# Image detection
curl -X POST "http://localhost:8000/api/detect/image" \
  -F "file=@test_image.jpg" \
  -F "confidence=0.4"
```

### Test with browser:
Visit: http://localhost:8000/docs for interactive API documentation.

## 📝 Notes

- ✅ All 3 models are included via Git LFS in `backend/models/` folder
- Adjust confidence threshold based on your needs (0.0 to 1.0)
- WebSocket is used for live camera streaming
- Gemini API key is optional but recommended for better voice descriptions
- Never commit `.env` file to Git (already in .gitignore)

## 🐛 Troubleshooting

**Models not loading?**
- Run `git lfs pull` to download models via Git LFS
- Verify model filenames: `yolov8m.pt`, `traffic_lights.pt` and `zebra_crossing.pt`
- Check Git LFS is installed: `git lfs version`
- Ensure all three models are in the `backend/models/` folder

**Gemini AI not working?**
- Check if `GEMINI_API_KEY` is set in `backend/.env`
- Verify API key is valid at [Google AI Studio](https://makersuite.google.com/)
- App will automatically fallback to Flan-T5 if Gemini fails

**CUDA/GPU errors?**
- YOLO will automatically use CPU if GPU is not available
- No changes needed, it works on both

**Port 8000 already in use?**
- Change port in `main.py`: `uvicorn.run(app, port=8001)`
