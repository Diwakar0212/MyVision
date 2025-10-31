# 🚀 Quick Start Guide

## ⚠️ Important Path Information

Your project structure:
```
C:\Users\diwakar\Downloads\syn-vision-main (1)\
└── syn-vision-main\                    ← Main project folder
    ├── backend\                        ← Backend API
    │   ├── models\                     ← Model files (yolov8m.pt, etc.)
    │   ├── main.py                     ← FastAPI server
    │   └── test_api.py                 ← Test script
    ├── src\                            ← React frontend
    └── start_backend.py                ← Quick start script
```

## 📋 Step-by-Step Instructions

### Step 1: Navigate to Correct Folder
```powershell
# From syn-vision-main (1) folder:
cd syn-vision-main
```

### Step 2: Start the Backend Server

**Option A - Using Quick Start Script (Recommended):**
```powershell
python start_backend.py
```

**Option B - Direct Command:**
```powershell
cd backend
python main.py
```

**Option C - Using Uvicorn:**
```powershell
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Step 3: Verify Server is Running

You should see:
```
==================================================
🚀 Starting MyVision API Server
==================================================
🔄 Loading YOLOv8m model...
✅ YOLOv8m model loaded.
🔄 Loading Traffic Light model...
✅ Traffic Light model loaded.
🔄 Loading Zebra Crossing model...
✅ Zebra Crossing model loaded.
✅ All models loaded successfully!
==================================================

INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 4: Test the API (In New Terminal)

Open a **NEW** PowerShell window and run:

```powershell
cd "C:\Users\diwakar\Downloads\syn-vision-main (1)\syn-vision-main\backend"
python test_api.py
```

Or test manually:
```powershell
# Test health
curl http://localhost:8000/health

# Or visit in browser
# http://localhost:8000/docs
```

## 🎯 Quick Commands Reference

```powershell
# Navigate to project root
cd "C:\Users\diwakar\Downloads\syn-vision-main (1)\syn-vision-main"

# Start backend server
python start_backend.py

# In another terminal, test API
cd backend
python test_api.py
```

## ✅ Checklist

Before running the server, ensure:

- [ ] All 3 model files are in `backend/models/` folder:
  - [ ] `yolov8m.pt`
  - [ ] `traffic_lights.pt`
  - [ ] `zebra_crossing.pt`

- [ ] Python dependencies installed:
  ```powershell
  pip install -r backend/requirements.txt
  ```

## 🐛 Common Issues

### Issue: "Cannot find path backend"
**Solution:** You're in the wrong folder. Use full path:
```powershell
cd "C:\Users\diwakar\Downloads\syn-vision-main (1)\syn-vision-main"
```

### Issue: "Connection refused" when testing
**Solution:** Server isn't running. Start it first in another terminal.

### Issue: "Models not loaded"
**Solution:** Check that all 3 model files are in `backend/models/` folder.

### Issue: Port 8000 already in use
**Solution:** 
```powershell
# Find and kill process using port 8000
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

## 🎬 Complete Workflow

**Terminal 1 (Server):**
```powershell
cd "C:\Users\diwakar\Downloads\syn-vision-main (1)\syn-vision-main"
python start_backend.py
# Keep this running...
```

**Terminal 2 (Testing):**
```powershell
cd "C:\Users\diwakar\Downloads\syn-vision-main (1)\syn-vision-main\backend"
python test_api.py
```

## 📚 API Endpoints

Once server is running, visit:
- http://localhost:8000 - API info
- http://localhost:8000/docs - Interactive API documentation
- http://localhost:8000/health - Health check

## 🔥 Quick Test with Image

```powershell
# From backend folder
curl -X POST "http://localhost:8000/api/detect" `
  -F "file=@your_image.jpg" `
  -F "confidence=0.5"
```

Or use the test script for interactive testing!

---

**Need more help?** Check:
- `VIDEO_SUPPORT.md` - Full API documentation
- `QUICK_REFERENCE.md` - API quick reference
- http://localhost:8000/docs - Interactive docs (when server is running)
