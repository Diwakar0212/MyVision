#!/usr/bin/env python3
"""
Quick Start Script for MyVision Backend
Run this to start the FastAPI server
"""

import subprocess
import sys
from pathlib import Path

def check_models():
    """Check if trained models exist"""
    models_dir = Path("backend/models")
    
    yolov8m = models_dir / "yolov8m.pt"
    traffic_lights = models_dir / "traffic_lights.pt"
    zebra_crossing = models_dir / "zebra_crossing.pt"
    
    missing = []
    
    if not yolov8m.exists():
        print("⚠️  WARNING: yolov8m.pt not found!")
        print(f"   Please copy your YOLOv8m model to: {yolov8m.absolute()}")
        missing.append("yolov8m.pt")
        
    if not traffic_lights.exists():
        print("⚠️  WARNING: traffic_lights.pt not found!")
        print(f"   Please copy your trained model to: {traffic_lights.absolute()}")
        missing.append("traffic_lights.pt")
        
    if not zebra_crossing.exists():
        print("⚠️  WARNING: zebra_crossing.pt not found!")
        print(f"   Please copy your trained model to: {zebra_crossing.absolute()}")
        missing.append("zebra_crossing.pt")
    
    if not missing:
        print("✅ All 3 model files found!")
        print(f"   ✓ yolov8m.pt")
        print(f"   ✓ traffic_lights.pt")
        print(f"   ✓ zebra_crossing.pt")
        return True
    
    return False

def main():
    print("="*60)
    print("🚀 MyVision FastAPI Backend - Quick Start")
    print("="*60)
    
    # Check models
    models_ok = check_models()
    
    if not models_ok:
        print("\n❌ Please add your trained models before starting the server.")
        print("   Copy your models to backend/models/ folder:")
        print("   - yolov8m.pt (YOLOv8m base model)")
        print("   - traffic_lights.pt (trained model)")
        print("   - zebra_crossing.pt (trained model)")
        response = input("\n   Continue anyway? (y/n): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    print("\n🔄 Starting FastAPI server...")
    print("   Server will be available at: http://localhost:8000")
    print("   API docs at: http://localhost:8000/docs")
    print("   Press Ctrl+C to stop\n")
    print("="*60 + "\n")
    
    # Start server
    subprocess.run([
        sys.executable, "-m", "uvicorn",
        "backend.main:app",
        "--reload",
        "--host", "0.0.0.0",
        "--port", "8000"
    ])

if __name__ == "__main__":
    main()
