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

### Step 1: Create models folder and add your trained models

```bash
# Navigate to backend folder
cd backend

# Create models folder
mkdir models

# Copy your trained models into this folder:
# - yolov8m.pt (YOLOv8m base model)
# - traffic_lights.pt (your traffic light model from Colab)
# - zebra_crossing.pt (your zebra crossing model from Colab)
```

**IMPORTANT:** Rename your models to match these exact names:
- `yolov8m.pt` → `yolov8m.pt` (place in models folder)
- `traffic lights.pt` → `traffic_lights.pt`
- `zebra crossing.pt` → `zebra_crossing.pt`

### Step 2: Install Python dependencies

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

- All models (including yolov8m.pt) must be in `backend/models/` folder
- Your custom models must be in `backend/models/` folder
- Adjust confidence threshold based on your needs (0.0 to 1.0)
- WebSocket is used for live camera streaming

## 🐛 Troubleshooting

**Models not loading?**
- Check if `models/` folder exists
- Verify model filenames: `yolov8m.pt`, `traffic_lights.pt` and `zebra_crossing.pt`
- Ensure all three models are in the `backend/models/` folder
- Check file paths in `main.py`

**CUDA/GPU errors?**
- YOLO will automatically use CPU if GPU is not available
- No changes needed, it works on both

**Port 8000 already in use?**
- Change port in `main.py`: `uvicorn.run(app, port=8001)`
