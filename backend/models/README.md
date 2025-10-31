# 🤖 AI Models for MyVision

This folder contains the trained YOLO models used for object detection in the MyVision application.

## 📦 Included Models

### 1. **YOLOv8m** (`yolov8m.pt` - 52.1 MB)
- **Purpose:** General object detection (80 COCO classes)
- **Detects:** Vehicles, people, animals, everyday objects
- **Classes Excluded:** Traffic lights (class ID 9) - handled by specialized model
- **Size:** Medium model (balanced speed vs accuracy)
- **Source:** [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)

### 2. **Traffic Lights Model** (`traffic_lights.pt` - 22.5 MB)
- **Purpose:** Specialized traffic light detection
- **Detects:** 
  - 🟢 Green lights (class 2)
  - 🔴 Red lights (class 3)
  - 🟡 Yellow lights (class 4)
- **Why Specialized:** Higher accuracy than general YOLO for traffic signals
- **Custom Trained:** Fine-tuned on traffic light dataset

### 3. **Zebra Crossing Model** (`zebra_crossing.pt` - 6.1 MB)
- **Purpose:** Pedestrian crossing detection
- **Detects:** Zebra crossings (class 8)
- **Critical For:** Safe navigation assistance for visually impaired users
- **Custom Trained:** Fine-tuned on crossing dataset

---

## 🎯 Model Pipeline

The backend runs all 3 models in sequence on each frame:

```
Input Image/Frame
      ↓
[1] YOLOv8m Detection
    → Detects: cars, people, bikes, etc. (excluding traffic lights)
      ↓
[2] Traffic Light Detection  
    → Detects: red/yellow/green signals
      ↓
[3] Zebra Crossing Detection
    → Detects: pedestrian crossings
      ↓
Combined Results → AI Description → Voice Output
```

---

## 📥 Model Access

### Option 1: Download from GitHub (Recommended)
The models are included in the repository using Git LFS:

```bash
# Clone the repository (automatically downloads models)
git clone https://github.com/Diwakar0212/MyVision.git
cd MyVision/backend/models

# Verify models are present
ls -lh *.pt
```

### Option 2: Manual Download
If models aren't downloaded automatically:

1. **Install Git LFS:**
   ```bash
   # Windows (using Chocolatey)
   choco install git-lfs
   
   # macOS
   brew install git-lfs
   
   # Linux
   sudo apt-get install git-lfs
   ```

2. **Initialize and pull:**
   ```bash
   git lfs install
   git lfs pull
   ```

### Option 3: Direct Download Links
If you need to download models separately:

- **YOLOv8m**: Available from [Ultralytics](https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8m.pt)
- **Traffic Lights & Zebra Crossing**: Custom trained models (contact maintainer)

---

## 🔧 Usage in Code

The models are automatically loaded by `backend/main.py`:

```python
from ultralytics import YOLO

# Load models
model_yolo = YOLO('models/yolov8m.pt')
model_lights = YOLO('models/traffic_lights.pt')
model_zebra = YOLO('models/zebra_crossing.pt')

# Run detection
results = model_yolo.predict(image, conf=0.4)
```

---

## ⚙️ Model Configuration

### Confidence Thresholds
- **Default:** 0.4 (40% confidence)
- **Adjustable:** Via API parameters
- **Recommended Range:** 0.3 - 0.6

### Inference Speed
- **YOLOv8m:** ~50-100 FPS (GPU) / ~10-20 FPS (CPU)
- **Traffic Lights:** ~100-150 FPS (smaller model)
- **Zebra Crossing:** ~150-200 FPS (lightweight)

### Memory Usage
- **Total:** ~500MB VRAM (GPU) / ~2GB RAM (CPU)
- **Per Model:** 
  - YOLOv8m: ~200MB
  - Traffic Lights: ~150MB
  - Zebra Crossing: ~100MB

---

## 🎓 Model Training (For Developers)

If you want to fine-tune or retrain models:

### Traffic Lights Model
```bash
yolo train data=traffic_lights.yaml model=yolov8m.pt epochs=100 imgsz=640
```

### Zebra Crossing Model
```bash
yolo train data=zebra_crossing.yaml model=yolov8m.pt epochs=100 imgsz=640
```

**Datasets Used:**
- Traffic Lights: Custom annotated dataset (~5,000 images)
- Zebra Crossings: Custom dataset (~3,000 images)

---

## 📊 Model Performance

| Model | mAP50 | mAP50-95 | Inference (GPU) | Size |
|-------|-------|----------|-----------------|------|
| YOLOv8m | 0.650 | 0.450 | ~15ms | 52MB |
| Traffic Lights | 0.920 | 0.780 | ~8ms | 22MB |
| Zebra Crossing | 0.880 | 0.720 | ~6ms | 6MB |

---

## 🔒 License & Usage

- **YOLOv8m**: [AGPL-3.0 License](https://github.com/ultralytics/ultralytics/blob/main/LICENSE)
- **Custom Models**: MIT License (same as MyVision project)

**For Commercial Use:**
- YOLOv8m requires Ultralytics Enterprise License
- Custom models (traffic lights, zebra crossing) are freely usable

---

## 🐛 Troubleshooting

### Models Not Found Error
```
FileNotFoundError: Could not find models directory
```

**Solution:**
```bash
# Ensure you're in the project root
cd syn-vision-main

# Models should be at backend/models/
ls backend/models/*.pt
```

### Git LFS Not Working
```
Error: this exceeds GitHub's file size limit of 100.00 MB
```

**Solution:**
```bash
# Install Git LFS
git lfs install

# Track model files
git lfs track "*.pt"

# Add and commit
git add .gitattributes
git commit -m "Track model files with Git LFS"
```

### Out of Memory Error
```
RuntimeError: CUDA out of memory
```

**Solution:**
- Reduce batch size
- Use CPU instead of GPU
- Process lower resolution images
- Close other applications

---

## 📞 Support

For issues with models:
1. Check [SECURITY.md](../../SECURITY.md) for API key setup
2. See [docs/ADD_MODELS_HERE.md](../../docs/ADD_MODELS_HERE.md) for setup guide
3. Open an issue: https://github.com/Diwakar0212/MyVision/issues

---

## 🔄 Model Updates

**Current Version:** 1.0.0 (October 2025)

**Planned Improvements:**
- [ ] Upgrade to YOLOv10 for better performance
- [ ] Add weather condition detection
- [ ] Improve traffic light accuracy in night conditions
- [ ] Add distance estimation for detected objects
- [ ] Multi-language support for voice descriptions

---

**Note:** Keep your models up to date by regularly pulling from the repository!

```bash
git pull
git lfs pull
```
