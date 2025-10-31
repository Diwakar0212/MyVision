# 🚀 Quick Reference - MyVision API

## Endpoints

### 🔍 Health Check
```
GET /health
```

### 📸 Unified Detection (Recommended)
```
POST /api/detect
```
**Auto-detects image or video**

### 📷 Image Only
```
POST /api/detect/image
```

### 🎬 Video Only
```
POST /api/detect/video
```

### 🔴 Live Stream
```
WebSocket: ws://localhost:8000/api/detect/live
```

---

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `file` | File | Required | Image or video file |
| `confidence` | Float | 0.4 | Detection threshold (0.0-1.0) |
| `sample_rate` | Int | 5 | For videos: process every Nth frame |

---

## Response Fields

### Image Response
- ✅ `type`: "image"
- ✅ `annotated_image`: Base64-encoded image
- ✅ `detections`: Array of detected objects
- ✅ `counts`: Summary counts
- ✅ `voice_description`: Audio description

### Video Response
- ✅ `type`: "video"
- ✅ `annotated_video`: Base64-encoded video
- ✅ `summary`: Aggregated statistics
- ✅ `total_frames`: Total frame count
- ✅ `processed_frames`: Frames analyzed
- ✅ `voice_description`: Audio description

---

## Sample Rates

| Rate | Speed | Quality | Use Case |
|------|-------|---------|----------|
| 1-3 | 🐌 Slow | ⭐⭐⭐ Best | Short clips, high accuracy |
| 5 | ⚡ Balanced | ⭐⭐ Good | **Recommended default** |
| 10-15 | 🚀 Fast | ⭐ OK | Long videos, quick analysis |
| 30+ | 💨 Very Fast | ⚠️ Low | Very long videos only |

---

## File Types Supported

### Images
`.jpg` `.jpeg` `.png` `.bmp` `.gif` `.webp` `.tiff`

### Videos
`.mp4` `.avi` `.mov` `.mkv` `.flv` `.wmv` `.webm`

---

## Quick Examples

### cURL - Image
```bash
curl -X POST http://localhost:8000/api/detect \
  -F "file=@image.jpg" \
  -F "confidence=0.5"
```

### cURL - Video
```bash
curl -X POST http://localhost:8000/api/detect \
  -F "file=@video.mp4" \
  -F "confidence=0.4" \
  -F "sample_rate=5"
```

### Python
```python
import requests

files = {'file': open('test.jpg', 'rb')}
data = {'confidence': 0.5}
response = requests.post('http://localhost:8000/api/detect', 
                        files=files, data=data)
result = response.json()
```

### JavaScript
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('confidence', '0.5');

fetch('http://localhost:8000/api/detect', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## Memory & Performance

✅ **Automatic garbage collection** every 100 frames  
✅ **Temporary file cleanup** after processing  
✅ **Frame-by-frame processing** for efficiency  
✅ **Configurable sample rate** for speed/quality  

---

## Common Issues

### ❌ Models not loaded
**Solution**: Check `backend/models/` folder has all 3 models

### ❌ Video too slow
**Solution**: Increase `sample_rate` to 10-15

### ❌ Out of memory
**Solution**: Increase `sample_rate` or reduce video resolution

### ❌ File too large
**Solution**: Split video or reduce resolution/quality

---

## Testing

Run the test script:
```bash
cd backend
python test_api.py
```

Or visit interactive docs:
```
http://localhost:8000/docs
```

---

## Models Used

1. **YOLOv8m** - General object detection (80 classes)
2. **Traffic Lights** - Red/Green/Yellow detection
3. **Zebra Crossing** - Pedestrian crossing detection

All models run on every frame (or sampled frames for video)!

---

## Need Help?

📖 Full docs: `backend/VIDEO_SUPPORT.md`  
🧪 Test script: `backend/test_api.py`  
📝 Summary: `UPDATE_SUMMARY.md`  
🌐 API docs: http://localhost:8000/docs
