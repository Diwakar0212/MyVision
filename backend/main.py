
from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from contextlib import asynccontextmanager
import cv2
import numpy as np
from typing import List, Dict, Optional
import base64
import io
from PIL import Image
from ultralytics import YOLO
import asyncio
from collections import Counter
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch
import google.generativeai as genai
import os
from dotenv import load_dotenv
from transformers import MarianMTModel, MarianTokenizer

# Load environment variables from .env file
load_dotenv()

# Lifespan context manager for startup/shutdown events (FastAPI modern approach)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("\n" + "="*50)
    print("🚀 Starting MyVision API Server")
    print("="*50)
    try:
        model_manager.load_models()
        print("="*50 + "\n")
        yield
    except asyncio.CancelledError:
        # Handle Python 3.13 asyncio CancelledError gracefully
        print("⚠️ Asyncio task cancelled (Python 3.13 compatibility issue)")
    finally:
        # Shutdown
        print("🛑 Shutting down MyVision API Server")

app = FastAPI(title="MyVision API", version="1.0.0", lifespan=lifespan)

# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:8085"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API Configuration
# Load API key from environment variable for security
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("⚠️  WARNING: GEMINI_API_KEY environment variable not set!")
    print("   Gemini AI features will not be available.")
    print("   Set it using: export GEMINI_API_KEY='your-key-here'  (Linux/Mac)")
    print("   Or: $env:GEMINI_API_KEY='your-key-here'  (Windows PowerShell)")

# Global models storage
class ModelManager:
    def __init__(self):
        self.model_yolo = None
        self.model_lights = None
        self.model_zebra = None
        self.models_loaded = False
        # LLM for natural language generation
        self.tokenizer = None
        self.llm_model = None
        self.llm_loaded = False
        # Gemini model for advanced intelligence
        self.gemini_model = None
        self.gemini_loaded = False
        
    def load_models(self):
        """Load all 3 YOLO models and Flan-T5 LLM"""
        try:
            import os
            # Determine the correct path based on current working directory
            if os.path.exists('models'):
                # Running from backend directory
                model_path = 'models'
            elif os.path.exists('backend/models'):
                # Running from project root
                model_path = 'backend/models'
            else:
                raise FileNotFoundError("Could not find models directory")
            
            print("🔄 Loading YOLOv8m model...")
            self.model_yolo = YOLO(f'{model_path}/yolov8m.pt')
            print("✅ YOLOv8m model loaded.")
            
            print("🔄 Loading Traffic Light model...")
            self.model_lights = YOLO(f'{model_path}/traffic_lights.pt')
            print("✅ Traffic Light model loaded.")
            
            print("🔄 Loading Zebra Crossing model...")
            self.model_zebra = YOLO(f'{model_path}/zebra_crossing.pt')
            print("✅ Zebra Crossing model loaded.")
            
            self.models_loaded = True
            print("✅ All YOLO models loaded successfully!")
            
            # Load Flan-T5 LLM for natural language generation
            try:
                print("🔄 Loading Flan-T5 language model...")
                self.tokenizer = AutoTokenizer.from_pretrained("google/flan-t5-small")
                self.llm_model = AutoModelForSeq2SeqLM.from_pretrained("google/flan-t5-small")
                self.llm_loaded = True
                print("✅ Flan-T5 model loaded successfully!")
            except Exception as llm_error:
                print(f"⚠️ Flan-T5 model not loaded: {llm_error}")
                print("   Voice descriptions will use template-based generation.")
                self.llm_loaded = False
            
            # Load Gemini model for advanced AI intelligence
            try:
                print("🔄 Loading Gemini AI model...")
                self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
                self.gemini_loaded = True
                print("✅ Gemini AI model loaded successfully!")
                print("   🎯 Advanced voice intelligence enabled!")
            except Exception as gemini_error:
                print(f"⚠️ Gemini model not loaded: {gemini_error}")
                print("   Will fallback to Flan-T5 or template-based generation.")
                self.gemini_loaded = False
            
            return True
            
        except Exception as e:
            print(f"❌ ERROR loading models: {e}")
            print("Please ensure models are in models/ or backend/models/ folder")
            self.models_loaded = False
            return False
    
    def detect_all(self, image: np.ndarray, conf_threshold: float = 0.4):
        """Run all 3 models and combine results"""
        if not self.models_loaded:
            raise ValueError("Models not loaded")
        
        all_detections = {
            "objects": [],
            "traffic_lights": [],
            "zebra_crossings": [],
            "annotated_image": None
        }
        
        # --- STEP 1: Run YOLOv8m (exclude traffic light class ID 9)
        yolo_classes_to_keep = [i for i in range(80) if i != 9]
        print("⚙️ Running YOLOv8m (cars, people, etc.)...")
        results_yolo = self.model_yolo.predict(image, classes=yolo_classes_to_keep, conf=conf_threshold, verbose=False)
        
        # Get detections
        for box in results_yolo[0].boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            label = self.model_yolo.names[cls]
            
            all_detections["objects"].append({
                "bbox": [int(x1), int(y1), int(x2), int(y2)],
                "confidence": conf,
                "class_id": cls,
                "label": label
            })
        
        annotated_image = results_yolo[0].plot()
        print(f"✅ Step 1: {len(all_detections['objects'])} objects detected")
        
        # --- STEP 2: Run Traffic Light Model (classes 2,3,4 = green, red, yellow)
        light_classes_to_keep = [2, 3, 4]
        print("⚙️ Running Traffic Light model...")
        results_lights = self.model_lights.predict(image, classes=light_classes_to_keep, conf=conf_threshold, verbose=False)
        
        for box in results_lights[0].boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            label = self.model_lights.names[cls]
            
            all_detections["traffic_lights"].append({
                "bbox": [int(x1), int(y1), int(x2), int(y2)],
                "confidence": conf,
                "class_id": cls,
                "label": label,
                "color": label  # green/red/yellow
            })
        
        annotated_image = results_lights[0].plot(img=annotated_image)
        print(f"✅ Step 2: {len(all_detections['traffic_lights'])} traffic lights detected")
        
        # --- STEP 3: Run Zebra Crossing Model (class 8 = zebra crossing)
        zebra_classes_to_keep = [8]
        print("⚙️ Running Zebra Crossing model...")
        results_zebra = self.model_zebra.predict(image, classes=zebra_classes_to_keep, conf=conf_threshold, verbose=False)
        
        for box in results_zebra[0].boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            
            all_detections["zebra_crossings"].append({
                "bbox": [int(x1), int(y1), int(x2), int(y2)],
                "confidence": conf,
                "class_id": cls,
                "label": "zebra_crossing"
            })
        
        final_annotated_image = results_zebra[0].plot(img=annotated_image)
        print(f"✅ Step 3: {len(all_detections['zebra_crossings'])} zebra crossings detected")
        
        all_detections["annotated_image"] = final_annotated_image
        
        return all_detections

# Initialize model manager
model_manager = ModelManager()

@app.get("/")
async def root():
    return {
        "message": "MyVision API is running! 👁️",
        "status": "online",
        "models_loaded": model_manager.models_loaded,
        "endpoints": {
            "health": "/health",
            "detect": "/api/detect (Auto-detect image/video)",
            "detect_image": "/api/detect/image",
            "detect_video": "/api/detect/video",
            "live_detection": "/api/detect/live (WebSocket)"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy" if model_manager.models_loaded else "models_not_loaded",
        "models": {
            "yolov8m": model_manager.model_yolo is not None,
            "traffic_lights": model_manager.model_lights is not None,
            "zebra_crossing": model_manager.model_zebra is not None
        }
    }

@app.post("/api/detect")
async def detect_objects(
    file: UploadFile = File(...),
    confidence: float = 0.4,
    sample_rate: int = 5
):
    """Unified endpoint: Automatically detects if file is image or video and processes accordingly"""
    # Check file type based on extension
    filename_lower = file.filename.lower()
    
    video_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm']
    image_extensions = ['.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp', '.tiff']
    
    is_video = any(filename_lower.endswith(ext) for ext in video_extensions)
    is_image = any(filename_lower.endswith(ext) for ext in image_extensions)
    
    if is_video:
        return await detect_objects_in_video(file, confidence, sample_rate)
    elif is_image:
        return await detect_objects_in_image(file, confidence)
    else:
        return JSONResponse(
            status_code=400,
            content={"error": "Unsupported file type. Please upload an image or video file."}
        )

@app.post("/api/detect/image")
async def detect_objects_in_image(
    file: UploadFile = File(...),
    confidence: float = 0.4
):
    """Detect objects in uploaded image using all 3 models"""
    try:
        if not model_manager.models_loaded:
            return JSONResponse(
                status_code=503,
                content={"error": "Models not loaded. Please check server logs."}
            )
        
        # Read and decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return JSONResponse(
                status_code=400,
                content={"error": "Invalid image file"}
            )
        
        print(f"\n📸 Processing image: {file.filename}")
        
        # Run all 3 models
        detections = model_manager.detect_all(image, confidence)
        
        # Convert annotated image to base64
        _, buffer = cv2.imencode('.jpg', detections["annotated_image"])
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Generate voice description for vision assistance
        description = generate_voice_description(detections)
        
        return {
            "success": True,
            "type": "image",
            "filename": file.filename,
            "detections": {
                "objects": detections["objects"],
                "traffic_lights": detections["traffic_lights"],
                "zebra_crossings": detections["zebra_crossings"]
            },
            "counts": {
                "total_objects": len(detections["objects"]),
                "traffic_lights": len(detections["traffic_lights"]),
                "zebra_crossings": len(detections["zebra_crossings"])
            },
            "voice_description": description,
            "annotated_image": f"data:image/jpeg;base64,{img_base64}"
        }
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/api/detect/video")
async def detect_objects_in_video(
    file: UploadFile = File(...),
    confidence: float = 0.4,
    sample_rate: int = 5  # Process every 5th frame for better quality
):
    """Detect objects in uploaded video and return annotated video"""
    import os
    import tempfile
    from collections import Counter
    
    temp_input = None
    temp_output = None
    
    try:
        if not model_manager.models_loaded:
            return JSONResponse(
                status_code=503,
                content={"error": "Models not loaded"}
            )
            
        # translators: key -> (tokenizer, model)
        self.translators = {}  # e.g. "en->hi": (tok, model)

        
        # Create temporary files with proper cleanup
        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        temp_output = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
        
        # Save uploaded video
        content = await file.read()
        temp_input.write(content)
        temp_input.close()
        
        print(f"\n🎥 Processing video: {file.filename}")
        
        # Open video
        cap = cv2.VideoCapture(temp_input.name)
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Video writer for annotated output
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(temp_output.name, fourcc, fps, (width, height))
        
        frame_count = 0
        processed_count = 0
        
        # Store the LAST processed frame's detections for final summary
        # (We don't want to sum across all frames - that inflates counts!)
        latest_objects = []
        latest_lights = []
        latest_zebra = []
        
        # Process video with memory efficiency
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process every Nth frame for detection, but write all frames
            if frame_count % sample_rate == 0:
                print(f"Processing frame {frame_count}/{total_frames}...")
                
                # Run detection
                detections = model_manager.detect_all(frame, confidence)
                annotated_frame = detections["annotated_image"]
                
                # Update to LATEST frame's detections (replaces previous, not extends)
                latest_objects = detections["objects"]
                latest_lights = detections["traffic_lights"]
                latest_zebra = detections["zebra_crossings"]
                
                processed_count += 1
                
                # Write annotated frame
                out.write(annotated_frame)
                
                # Cache the last annotated frame for skipped frames
                last_annotated = annotated_frame
            else:
                # For skipped frames, write the last annotated frame to maintain smooth video
                if 'last_annotated' in locals():
                    out.write(last_annotated)
                else:
                    out.write(frame)
            
            frame_count += 1
            
            # Memory management: Force garbage collection every 100 frames
            if frame_count % 100 == 0:
                import gc
                gc.collect()
        
        # Release resources
        cap.release()
        out.release()
        
        # Count unique object labels for summary (from LATEST frame only)
        object_labels = [d.get('label', 'unknown') for d in latest_objects]
        light_colors = [d.get('color', d.get('label', 'unknown')) for d in latest_lights]
        object_counts = Counter(object_labels)
        light_counts = Counter(light_colors)
        
        print(f"✅ Video processing complete: {frame_count} frames, {processed_count} processed")
        print(f"📊 Latest frame detections: {len(latest_objects)} objects, {len(latest_lights)} lights, {len(latest_zebra)} zebra crossings")
        
        # Read annotated video and convert to base64
        with open(temp_output.name, 'rb') as f:
            video_bytes = f.read()
            video_base64 = base64.b64encode(video_bytes).decode('utf-8')
        
        # Generate voice description using LATEST frame's detections
        summary_detections = {
            "objects": latest_objects,
            "traffic_lights": latest_lights,
            "zebra_crossings": latest_zebra
        }
        description = generate_voice_description(summary_detections, width, height)
        
        # Calculate video duration
        duration = frame_count / fps if fps > 0 else 0
        
        return {
            "success": True,
            "type": "video",
            "filename": file.filename,
            "detections": {
                "objects": latest_objects,  # Latest frame's objects with confidence
                "traffic_lights": latest_lights,  # Latest frame's lights with confidence
                "zebra_crossings": latest_zebra  # Latest frame's zebra crossings with confidence
            },
            "counts": {
                "total_objects": len(latest_objects),
                "traffic_lights": len(latest_lights),
                "zebra_crossings": len(latest_zebra)
            },
            "video_info": {
                "total_frames": frame_count,
                "processed_frames": processed_count,
                "fps": fps,
                "duration": duration
            },
            "voice_description": description,
            "annotated_video": f"data:video/mp4;base64,{video_base64}"
        }
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )
    
    finally:
        # Cleanup temporary files
        try:
            if temp_input and os.path.exists(temp_input.name):
                os.unlink(temp_input.name)
            if temp_output and os.path.exists(temp_output.name):
                os.unlink(temp_output.name)
        except Exception as cleanup_error:
            print(f"⚠️ Cleanup warning: {cleanup_error}")

@app.websocket("/api/detect/live")
async def websocket_live_detection(websocket: WebSocket):
    """WebSocket endpoint for real-time camera detection"""
    await websocket.accept()
    print("🔌 WebSocket client connected")
    
    try:
        while True:
            # Receive frame from client (base64 encoded)
            data = await websocket.receive_text()
            
            # Decode base64 image
            if ',' in data:
                img_data = base64.b64decode(data.split(',')[1])
            else:
                img_data = base64.b64decode(data)
            
            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is not None and model_manager.models_loaded:
                # Run all 3 models
                detections = model_manager.detect_all(frame, conf_threshold=0.4)
                
                # Get frame dimensions for better descriptions
                frame_height, frame_width = frame.shape[:2]
                
                # Encode annotated frame
                _, buffer = cv2.imencode('.jpg', detections["annotated_image"])
                img_base64 = base64.b64encode(buffer).decode('utf-8')
                
                # Generate voice description with Gemini AI
                description = generate_voice_description(detections, frame_width, frame_height)
                
                # Send back results
                await websocket.send_json({
                    "annotated_frame": f"data:image/jpeg;base64,{img_base64}",
                    "detections": {
                        "objects": detections["objects"],
                        "traffic_lights": detections["traffic_lights"],
                        "zebra_crossings": detections["zebra_crossings"]
                    },
                    "voice_description": description
                })
                
    except WebSocketDisconnect:
        print("🔌 WebSocket client disconnected")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        await websocket.close()

# --- Helper Functions for Advanced Vision Assistance ---

# Object categorization for smart descriptions
MOVING_OBJECTS = {
    'person', 'car', 'truck', 'bus', 'motorcycle', 'bicycle', 'bike',
    'dog', 'cat', 'horse', 'bird', 'train', 'boat', 'airplane'
}

STATIC_OBJECTS = {
    'backpack', 'handbag', 'suitcase', 'umbrella', 'bottle', 'cup',
    'chair', 'bench', 'potted plant', 'vase', 'clock', 'book',
    'laptop', 'keyboard', 'cell phone', 'teddy bear', 'scissors',
    'traffic light', 'stop sign', 'parking meter', 'fire hydrant'
}

INFRASTRUCTURE = {
    'traffic light', 'stop sign', 'parking meter', 'fire hydrant',
    'street sign', 'bench'
}

def get_proximity(box: List[float]) -> float:
    """Calculate proximity based on bounding box height (proxy for distance)"""
    return box[3] - box[1]  # y2 - y1

def get_direction(box: List[float], frame_width: int) -> str:
    """Estimate direction relative to frame using 5 zones"""
    x_center = (box[0] + box[2]) / 2
    if x_center < frame_width * 0.2:
        return "far left"
    elif x_center < frame_width * 0.4:
        return "left"
    elif x_center < frame_width * 0.6:
        return "center"
    elif x_center < frame_width * 0.8:
        return "right"
    else:
        return "far right"

def is_moving_object(label: str) -> bool:
    """Check if an object can move"""
    return label.lower() in MOVING_OBJECTS

def is_static_object(label: str) -> bool:
    """Check if an object is typically static"""
    return label.lower() in STATIC_OBJECTS

def get_closest_object(detections: List[Dict]) -> Optional[Dict]:
    """Find the closest object based on proximity"""
    if not detections:
        return None
    return max(detections, key=lambda d: get_proximity(d.get("bbox", [0, 0, 0, 0])))

def check_safety(detections: Dict, frame_height: int) -> bool:
    """Determine if it's safe to cross based on traffic conditions"""
    # Check for green light
    has_green = any(
        d.get("label", "").lower() in ["green", "green light"] 
        for d in detections.get("traffic_lights", [])
    )
    
    # Check for nearby cars
    has_car_close = any(
        d.get("label", "").lower() == "car" and 
        get_proximity(d.get("bbox", [0, 0, 0, 0])) > 0.2 * frame_height
        for d in detections.get("objects", [])
    )
    
    # Check for nearby people
    has_person_close = any(
        d.get("label", "").lower() == "person" and 
        get_proximity(d.get("bbox", [0, 0, 0, 0])) > 0.2 * frame_height
        for d in detections.get("objects", [])
    )
    
    if has_car_close or has_person_close:
        return False
    if has_green and not (has_car_close or has_person_close):
        return True
    return False

def summarize_objects(detections: List[Dict]) -> str:
    """Summarize detected objects with counts"""
    counts = Counter(d.get("label", "unknown") for d in detections)
    summary = []
    for label, count in counts.items():
        if count == 1:
            summary.append(f"1 {label.lower()}")
        else:
            summary.append(f"{count} {label.lower()}s")
    return ", ".join(summary)

def generate_polite_text(base_instruction: str, tokenizer, llm_model) -> str:
    """Use Flan-T5 LLM to make instructions polite and natural"""
    if not tokenizer or not llm_model:
        return base_instruction
    
    try:
        prompt = f"Convert this instruction into a polite, natural sentence: {base_instruction}"
        input_ids = tokenizer(prompt, return_tensors="pt").input_ids
        
        # Generate with beam search for better quality
        with torch.no_grad():
            outputs = llm_model.generate(
                input_ids, 
                max_length=60, 
                num_beams=4, 
                early_stopping=True,
                no_repeat_ngram_size=2
            )
        
        polite_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return polite_text if polite_text else base_instruction
    except Exception as e:
        print(f"⚠️ LLM generation error: {e}")
        return base_instruction

def generate_gemini_description(detections: Dict, gemini_model) -> str:
    """Use Gemini AI for ultra-natural, context-aware voice descriptions"""
    if not gemini_model:
        return None
    
    try:
        # Build context for Gemini
        moving_objects = []
        static_objects = []
        
        for obj in detections.get("objects", []):
            label = obj.get("label", "unknown").lower()
            if is_moving_object(label):
                moving_objects.append(obj)
            else:
                static_objects.append(obj)
        
        # Count objects
        moving_counts = Counter([d.get("label", "object").lower() for d in moving_objects])
        static_counts = Counter([d.get("label", "object").lower() for d in static_objects])
        traffic_lights = detections.get("traffic_lights", [])
        zebra_crossings = detections.get("zebra_crossings", [])
        
        # Build Gemini prompt
        prompt = f"""You are an AI assistant helping a visually impaired person navigate safely. 
Analyze this scene and provide a brief, clear, helpful voice description (max 2-3 sentences).

Scene Details:
- Moving objects (vehicles/people): {dict(moving_counts) if moving_counts else "None"}
- Static objects: {dict(static_counts) if static_counts else "None"}
- Traffic lights: {[d.get('color', d.get('label', '')) for d in traffic_lights] if traffic_lights else "None"}
- Zebra crossings: {"Yes" if zebra_crossings else "No"}

Guidelines:
1. Prioritize safety-critical information (traffic lights, vehicles, crossings)
2. Use conversational, warm language
3. Give clear, actionable guidance (safe to cross / wait)
4. Don't mention static objects unless very relevant
5. Be concise and calming

Voice description:"""

        # Generate with Gemini
        response = gemini_model.generate_content(prompt)
        gemini_text = response.text.strip()
        
        return gemini_text if gemini_text else None
        
    except Exception as e:
        print(f"⚠️ Gemini generation error: {e}")
        return None

def generate_voice_description(detections: Dict, frame_width: Optional[int] = None, frame_height: Optional[int] = None) -> str:
    """Generate natural language description for vision assistance with smart object categorization"""
    
    # Try Gemini first (most natural)
    if model_manager.gemini_loaded:
        gemini_desc = generate_gemini_description(detections, model_manager.gemini_model)
        if gemini_desc:
            return gemini_desc
    
    # Separate objects by category
    moving_objects = []
    static_objects = []
    traffic_lights = detections.get("traffic_lights", [])
    zebra_crossings = detections.get("zebra_crossings", [])
    
    for obj in detections.get("objects", []):
        label = obj.get("label", "unknown").lower()
        if is_moving_object(label):
            moving_objects.append(obj)
        else:
            static_objects.append(obj)
    
def _use_gemini_translate(text: str, target_lang: str) -> Optional[str]:
    """Use Gemini to translate/produce target language text (if available)."""
    if not model_manager.gemini_loaded:
        return None
    try:
        prompt = f"Translate the following text to {target_lang}. Keep it natural and concise:\n\n{text}"
        response = model_manager.gemini_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"⚠️ Gemini translate failed: {e}")
        return None

def _use_flan_translate(text: str, target_lang: str) -> Optional[str]:
    """Use Flan-T5 to translate by prompting (if LLM loaded)."""
    if not model_manager.llm_loaded or not model_manager.tokenizer or not model_manager.llm_model:
        return None
    try:
        prompt = f"Translate into {target_lang}: {text}"
        input_ids = model_manager.tokenizer(prompt, return_tensors="pt").input_ids
        with torch.no_grad():
            outputs = model_manager.llm_model.generate(
                input_ids,
                max_length=200,
                num_beams=4,
                early_stopping=True
            )
        translated = model_manager.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return translated.strip()
    except Exception as e:
        print(f"⚠️ Flan translate failed: {e}")
        return None

def _use_marian_translate(text: str, target_code: str) -> Optional[str]:
    """Use MarianMT translator when available. target_code is like 'en->hi' or 'en->mr'"""
    try:
        if target_code not in model_manager.translators:
            return None
        tok, model = model_manager.translators[target_code]
        batch = tok.prepare_seq2seq_batch([text], return_tensors="pt")
        with torch.no_grad():
            gen = model.generate(**batch)
        translated = tok.batch_decode(gen, skip_special_tokens=True)[0]
        return translated.strip()
    except Exception as e:
        print(f"⚠️ Marian translate failed ({target_code}): {e}")
        return None

def translate_text(text: str, target_lang: str) -> str:
    """
    Translate `text` into target_lang.
    target_lang: 'en'|'hi'|'mr' (case-insensitive)
    Preference: Gemini -> Flan -> Marian -> template fallback (same text if all fail)
    """
    if not text:
        return text

    tgt = target_lang.lower()
    # If english requested, return as-is
    if tgt in ("en", "eng", "english"):
        return text

    # 1) Gemini direct
    gem = _use_gemini_translate(text, {"hi":"Hindi","mr":"Marathi"}.get(tgt, tgt))
    if gem:
        return gem

    # 2) Flan-T5 (prompt-based)
    fl = _use_flan_translate(text, {"hi":"Hindi","mr":"Marathi"}.get(tgt, tgt))
    if fl:
        return fl

    # 3) MarianMT (en->hi/en->mr)
    if tgt in ("hi", "mr"):
        key = f"en->{tgt}"
        mar = _use_marian_translate(text, key)
        if mar:
            return mar

    # 4) fallback templates: simple replacements for a few fixed sentences
    FALLBACKS = {
        "hi": {
            "The traffic light is red": "ट्रैफिक सिग्नल लाल है",
            "The traffic light is green": "ट्रैफिक सिग्नल हरा है",
            "A zebra crossing is visible": "ज़ेब्रा क्रॉसिंग दिखाई दे रही है",
            "Please wait signal is green and car is near you": "कृपया प्रतीक्षा करें, कार पास है",
            "Go ahead please take caustion": "जाकर आगे बढ़ें — सावधानी बरतें"
        },
        "mr": {
            "The traffic light is red": "ट्रॅफिक लाईट लाल आहे",
            "The traffic light is green": "ट्रॅफिक लाईट हिरवा आहे",
            "A zebra crossing is visible": "झेब्रा क्रॉसिंग दिसत आहे",
            "Please wait signal is green and car is near you": "कृपया थांबा, वाहन तुमच्या जवळ आहे",
            "Go ahead please take caustion": "आता जा — काळजी घ्या"
        }
    }
    if tgt in FALLBACKS:
        # try phrase-level replacement
        out = text
        for en_phrase, trans in FALLBACKS[tgt].items():
            out = out.replace(en_phrase, trans)
        if out != text:
            return out

    # last resort, return original (English)
    return text

@app.post("/api/detect/image")
async def detect_objects_in_image(
    file: UploadFile = File(...),
    confidence: float = 0.4,
    lang: str = "en"
):
    # Read uploaded image bytes and decode to OpenCV image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        return {"success": False, "error": "Invalid image file"}

    # Run all 3 models
    detections = model_manager.detect_all(image, confidence)

    # Convert annotated image to base64
    _, buffer = cv2.imencode('.jpg', detections.get("annotated_image", image))
    img_base64 = base64.b64encode(buffer).decode('utf-8')

    # Generate voice description in English first
    description_en = generate_voice_description(detections, frame_width=image.shape[1], frame_height=image.shape[0])

    # Translate description to requested language
    description_translated = translate_text(description_en, lang)

    # Minimal structured response
    return {
        "success": True,
        "type": "image",
        "filename": getattr(file, 'filename', None),
        "detections": detections,
        "counts": {
            "total_objects": len(detections.get("objects", [])),
            "traffic_lights": len(detections.get("traffic_lights", [])),
            "zebra_crossings": len(detections.get("zebra_crossings", []))
        },
        "voice_description": description_translated,
        "voice_description_en": description_en if lang.lower() != 'en' else None,
        "annotated_image": f"data:image/jpeg;base64,{img_base64}"
    }
@app.websocket("/api/detect/live")
async def websocket_live_detection(websocket: WebSocket):
    await websocket.accept()
    print("🔌 WebSocket client connected")

    # default language
    current_lang = "en"
    try:
        while True:
            data = await websocket.receive_text()

            # If initial message sets language as JSON
            try:
                import json
                parsed = json.loads(data)
                if isinstance(parsed, dict) and parsed.get("type") == "init":
                    current_lang = parsed.get("lang", current_lang)
                    await websocket.send_json({"status":"ok","lang":current_lang})
                    continue
            except Exception:
                # not JSON init, proceed to treat data as base64 image
                pass

            # decode image (same as before)
            if ',' in data:
                img_data = base64.b64decode(data.split(',')[1])
            else:
                img_data = base64.b64decode(data)

            nparr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            if frame is not None and model_manager.models_loaded:
                detections = model_manager.detect_all(frame, conf_threshold=0.4)
                frame_height, frame_width = frame.shape[:2]

                _, buffer = cv2.imencode('.jpg', detections["annotated_image"])
                img_base64 = base64.b64encode(buffer).decode('utf-8')

                # english desc then translate
                desc_en = generate_voice_description(detections, frame_width, frame_height)
                desc_trans = translate_text(desc_en, current_lang)

                await websocket.send_json({
                    "annotated_frame": f"data:image/jpeg;base64,{img_base64}",
                    "detections": {...},
                    "voice_description": desc_trans
                })
    except Exception as e:
        print(f"⚠️ WebSocket error: {e}")
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
try:
    from gtts import gTTS
except Exception:
    gTTS = None

def tts_save(text, lang_code='hi', file_path='/tmp/out.mp3'):
    if gTTS is None:
        print("⚠️ gTTS not available (package missing). Skipping TTS save.")
        return None
    tts = gTTS(text=text, lang=lang_code)
    tts.save(file_path)
    return file_path

    
    # Build smart description
    description_parts = []
    
    # 1. Traffic Light Status (Infrastructure)
    if traffic_lights:
        colors = [d.get('color', d.get('label', '')).lower() for d in traffic_lights]
        if 'red' in colors:
            description_parts.append("The traffic light is red")
        elif 'green' in colors:
            description_parts.append("The traffic light is green")
        elif 'yellow' in colors:
            description_parts.append("The traffic light is yellow")
    
    # 2. Moving Objects (Vehicles and Pedestrians) - these can "approach"
    if moving_objects:
        moving_counts = Counter([d.get("label", "object").lower() for d in moving_objects])
        moving_list = []
        for name, count in moving_counts.most_common():
            if count == 1:
                moving_list.append(f"1 {name}")
            else:
                # Smart pluralization
                plural = name + 's' if not name.endswith('s') else name
                moving_list.append(f"{count} {plural}")
        
        moving_summary = ", ".join(moving_list)
        
        # Add directional context for closest moving object
        if frame_width:
            closest_moving = max(moving_objects, key=lambda d: get_proximity(d.get("bbox", [0, 0, 0, 0])))
            direction = get_direction(closest_moving.get("bbox", [0, 0, 0, 0]), frame_width)
            
            if len(moving_objects) == 1:
                description_parts.append(f"There is {moving_summary} on your {direction}")
            else:
                description_parts.append(f"There are {moving_summary} on the road, closest on your {direction}")
        else:
            description_parts.append(f"There are {moving_summary} on the road")
    
    # 3. Zebra Crossings
    if zebra_crossings:
        count = len(zebra_crossings)
        if count == 1:
            description_parts.append("A zebra crossing is visible")
        else:
            description_parts.append(f"{count} zebra crossings are visible")
    
    # 4. Static Objects (Background context only)
    if static_objects and len(static_objects) <= 3:  # Only mention if few items
        static_counts = Counter([d.get("label", "object").lower() for d in static_objects])
        static_list = []
        for name, count in static_counts.most_common(2):  # Max 2 types
            if count == 1:
                static_list.append(f"a {name}")
            else:
                static_list.append(f"{count} {name}s")
        
        if static_list:
            description_parts.append(f"You can see {', '.join(static_list)} nearby")
    
    # 5. Safety Assessment
    has_red_light = any(d.get('color', '').lower() == 'red' or d.get('label', '').lower() == 'red' for d in traffic_lights)
    has_green_light = any(d.get('color', '').lower() == 'green' or d.get('label', '').lower() == 'green' for d in traffic_lights)
    has_vehicles = any(obj.get('label', '').lower() in ['car', 'truck', 'bus', 'motorcycle'] for obj in moving_objects)
    
    if has_red_light or has_vehicles:
        description_parts.append("Please wait before crossing")
    elif has_green_light and not has_vehicles:
        description_parts.append("You may proceed with caution")
    
    # Combine all parts
    if description_parts:
        return ". ".join(description_parts) + "."
    
    # Return empty string when nothing is detected (no need to announce clear path)
    return ""

if __name__ == "__main__":
    import uvicorn
    # Fixed for Python 3.13: Using lifespan instead of @app.on_event and removed reload
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
