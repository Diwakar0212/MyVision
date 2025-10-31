# 🎥 Video & Image Detection API

## Overview

The backend now supports **both image and video uploads** with automatic detection and annotation. The API intelligently handles memory management and processing time optimization for videos.

## 🚀 Key Features

### ✨ Unified Endpoint
- **`POST /api/detect`** - Automatically detects file type and processes accordingly
- Supports both images and videos in a single endpoint
- Returns `type: "image"` or `type: "video"` in response

### 📸 Image Processing
- Instant processing and annotation
- Returns base64-encoded annotated image
- Low memory footprint

### 🎬 Video Processing
- Frame-by-frame annotation with memory optimization
- Configurable sample rate for processing speed
- Returns complete annotated video as base64
- Automatic garbage collection every 100 frames
- Proper temporary file cleanup

## 📡 API Endpoints

### 1. Unified Detection (Recommended)
```bash
POST /api/detect
```

**Automatically detects if the file is an image or video**

**Form Data:**
- `file`: Image or video file
- `confidence`: Detection confidence threshold (default: 0.4)
- `sample_rate`: Video processing rate - process every Nth frame (default: 5)

**Supported Formats:**
- **Images**: .jpg, .jpeg, .png, .bmp, .gif, .webp, .tiff
- **Videos**: .mp4, .avi, .mov, .mkv, .flv, .wmv, .webm

---

### 2. Image Detection
```bash
POST /api/detect/image
```

**Parameters:**
- `file`: Image file
- `confidence`: Detection threshold (0.0-1.0, default: 0.4)

**Response:**
```json
{
  "success": true,
  "type": "image",
  "filename": "example.jpg",
  "detections": {
    "objects": [...],
    "traffic_lights": [...],
    "zebra_crossings": [...]
  },
  "counts": {
    "total_objects": 5,
    "traffic_lights": 1,
    "zebra_crossings": 1
  },
  "voice_description": "I see 2 cars, 1 person. Red traffic light ahead...",
  "annotated_image": "data:image/jpeg;base64,..."
}
```

---

### 3. Video Detection
```bash
POST /api/detect/video
```

**Parameters:**
- `file`: Video file
- `confidence`: Detection threshold (0.0-1.0, default: 0.4)
- `sample_rate`: Process every Nth frame (default: 5)
  - Lower value = Better quality, slower processing
  - Higher value = Faster processing, less accurate

**Response:**
```json
{
  "success": true,
  "type": "video",
  "filename": "example.mp4",
  "total_frames": 300,
  "processed_frames": 60,
  "summary": {
    "objects_detected": {
      "car": 45,
      "person": 23,
      "bicycle": 5
    },
    "traffic_lights": {
      "red": 10,
      "green": 15,
      "yellow": 3
    },
    "zebra_crossings_detected": 5
  },
  "voice_description": "I see 45 cars, 23 persons...",
  "annotated_video": "data:video/mp4;base64,..."
}
```

## 🔧 Usage Examples

### Example 1: Upload Image with Python
```python
import requests

url = "http://localhost:8000/api/detect"
files = {"file": open("test_image.jpg", "rb")}
data = {"confidence": 0.5}

response = requests.post(url, files=files, data=data)
result = response.json()

if result["type"] == "image":
    # Display annotated image
    annotated_image = result["annotated_image"]
    print(result["voice_description"])
```

### Example 2: Upload Video with Python
```python
import requests

url = "http://localhost:8000/api/detect"
files = {"file": open("test_video.mp4", "rb")}
data = {
    "confidence": 0.4,
    "sample_rate": 10  # Process every 10th frame for faster processing
}

response = requests.post(url, files=files, data=data)
result = response.json()

if result["type"] == "video":
    # Save annotated video
    video_base64 = result["annotated_video"].split(",")[1]
    import base64
    video_bytes = base64.b64decode(video_base64)
    
    with open("annotated_video.mp4", "wb") as f:
        f.write(video_bytes)
    
    print(f"Processed {result['processed_frames']} frames")
    print(result["summary"])
```

### Example 3: Using cURL
```bash
# Image upload
curl -X POST "http://localhost:8000/api/detect" \
  -F "file=@test_image.jpg" \
  -F "confidence=0.5"

# Video upload
curl -X POST "http://localhost:8000/api/detect" \
  -F "file=@test_video.mp4" \
  -F "confidence=0.4" \
  -F "sample_rate=5"
```

### Example 4: JavaScript/TypeScript (Frontend)
```typescript
async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('confidence', '0.5');
  
  if (file.type.startsWith('video/')) {
    formData.append('sample_rate', '5');
  }
  
  const response = await fetch('http://localhost:8000/api/detect', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (result.type === 'image') {
    // Display image
    const img = document.createElement('img');
    img.src = result.annotated_image;
    document.body.appendChild(img);
  } else if (result.type === 'video') {
    // Display video
    const video = document.createElement('video');
    video.src = result.annotated_video;
    video.controls = true;
    document.body.appendChild(video);
  }
  
  // Display voice description
  console.log(result.voice_description);
}
```

## ⚡ Performance Optimization

### Memory Management
1. **Frame-by-frame processing**: Frames are processed and released immediately
2. **Garbage collection**: Automatic cleanup every 100 frames
3. **Temporary file cleanup**: All temp files are deleted after processing
4. **Sample rate optimization**: Configurable frame sampling for speed/quality balance

### Processing Speed Guidelines

| Video Length | Recommended Sample Rate | Approx. Processing Time |
|-------------|------------------------|------------------------|
| 0-10 sec    | 1-3 (High quality)     | 10-30 seconds         |
| 10-30 sec   | 3-5 (Balanced)         | 20-60 seconds         |
| 30-60 sec   | 5-10 (Fast)            | 30-90 seconds         |
| 1-2 min     | 10-15 (Very fast)      | 1-2 minutes           |
| 2+ min      | 15-30 (Ultra fast)     | 2-5 minutes           |

**Note**: Actual processing time depends on:
- Video resolution (720p vs 1080p vs 4K)
- Server CPU/GPU capabilities
- Number of objects in frames
- Confidence threshold (lower = more detections = slower)

### Sample Rate Impact
- `sample_rate = 1`: Process every frame (best quality, slowest)
- `sample_rate = 5`: Process every 5th frame (balanced, recommended)
- `sample_rate = 10`: Process every 10th frame (fast, good for long videos)
- `sample_rate = 30`: Process every 30th frame (very fast, may miss quick events)

## 🐛 Troubleshooting

### Video Too Large
- Increase `sample_rate` to process fewer frames
- Reduce video resolution before uploading
- Split long videos into shorter segments

### Out of Memory Error
- Server automatically manages memory with garbage collection
- If error persists, increase `sample_rate`
- Reduce video resolution
- Restart server to clear any memory leaks

### Slow Processing
- Increase `sample_rate` for faster processing
- Lower video resolution
- Reduce `confidence` threshold if too many false positives
- Ensure server has adequate CPU/GPU resources

### Unsupported Format
- Convert video to MP4 using ffmpeg:
  ```bash
  ffmpeg -i input.mov -c:v libx264 -c:a aac output.mp4
  ```

## 🎯 Best Practices

1. **For Real-time Applications**: Use WebSocket endpoint (`/api/detect/live`) instead
2. **For Short Clips (<30s)**: Use `sample_rate = 3-5` for good quality
3. **For Long Videos**: Use `sample_rate = 10-15` for faster processing
4. **For High Accuracy**: Use `sample_rate = 1` and higher confidence threshold
5. **Storage**: Annotated videos are base64-encoded, decode and save for efficiency

## 📊 Response Types

The API returns different fields based on file type:

### Image Response Includes:
- `annotated_image`: Base64-encoded image
- `detections`: Detailed object information
- `counts`: Object count summary

### Video Response Includes:
- `annotated_video`: Base64-encoded video
- `summary`: Aggregated detection statistics
- `total_frames`: Total video frames
- `processed_frames`: Number of frames analyzed

Both include:
- `voice_description`: Natural language description
- `success`: Boolean status
- `type`: "image" or "video"
- `filename`: Original filename
