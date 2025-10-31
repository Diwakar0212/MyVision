"""
Test script for MyVision API - Image and Video Detection
"""
import requests
import base64
import os

API_URL = "http://localhost:8000"

def test_health():
    """Check if API is running and models are loaded"""
    print("\n" + "="*60)
    print("🔍 Testing API Health...")
    print("="*60)
    
    response = requests.get(f"{API_URL}/health")
    result = response.json()
    
    print(f"Status: {result['status']}")
    print(f"Models loaded:")
    for model, loaded in result['models'].items():
        status = "✅" if loaded else "❌"
        print(f"  {status} {model}")
    
    return result['status'] == 'healthy'

def test_image_detection(image_path: str, confidence: float = 0.5):
    """Test image detection"""
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return
    
    print("\n" + "="*60)
    print(f"📸 Testing Image Detection: {image_path}")
    print("="*60)
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        data = {'confidence': confidence}
        
        response = requests.post(f"{API_URL}/api/detect", files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        
        print(f"\n✅ Success!")
        print(f"Type: {result['type']}")
        print(f"Filename: {result['filename']}")
        print(f"\nDetection Counts:")
        print(f"  - Total objects: {result['counts']['total_objects']}")
        print(f"  - Traffic lights: {result['counts']['traffic_lights']}")
        print(f"  - Zebra crossings: {result['counts']['zebra_crossings']}")
        print(f"\n🔊 Voice Description:")
        print(f"  {result['voice_description']}")
        
        # Save annotated image
        if 'annotated_image' in result:
            output_path = f"annotated_{os.path.basename(image_path)}"
            img_data = result['annotated_image'].split(',')[1]
            img_bytes = base64.b64decode(img_data)
            
            with open(output_path, 'wb') as f:
                f.write(img_bytes)
            
            print(f"\n💾 Annotated image saved: {output_path}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.json())

def test_video_detection(video_path: str, confidence: float = 0.4, sample_rate: int = 5):
    """Test video detection"""
    if not os.path.exists(video_path):
        print(f"❌ Video not found: {video_path}")
        return
    
    print("\n" + "="*60)
    print(f"🎥 Testing Video Detection: {video_path}")
    print("="*60)
    print(f"Confidence: {confidence}, Sample Rate: {sample_rate}")
    print("⏳ Processing... (this may take a while)")
    
    with open(video_path, 'rb') as f:
        files = {'file': f}
        data = {
            'confidence': confidence,
            'sample_rate': sample_rate
        }
        
        response = requests.post(f"{API_URL}/api/detect", files=files, data=data, timeout=300)
    
    if response.status_code == 200:
        result = response.json()
        
        print(f"\n✅ Success!")
        print(f"Type: {result['type']}")
        print(f"Filename: {result['filename']}")
        print(f"\nVideo Stats:")
        print(f"  - Total frames: {result['total_frames']}")
        print(f"  - Processed frames: {result['processed_frames']}")
        print(f"  - Processing rate: {(result['processed_frames']/result['total_frames']*100):.1f}%")
        
        print(f"\n📊 Detection Summary:")
        if result['summary']['objects_detected']:
            print(f"  Objects detected:")
            for obj, count in list(result['summary']['objects_detected'].items())[:5]:
                print(f"    - {obj}: {count}")
        
        if result['summary']['traffic_lights']:
            print(f"  Traffic lights:")
            for color, count in result['summary']['traffic_lights'].items():
                print(f"    - {color}: {count}")
        
        if result['summary']['zebra_crossings_detected'] > 0:
            print(f"  Zebra crossings: {result['summary']['zebra_crossings_detected']}")
        
        print(f"\n🔊 Voice Description:")
        print(f"  {result['voice_description']}")
        
        # Save annotated video
        if 'annotated_video' in result:
            output_path = f"annotated_{os.path.basename(video_path)}"
            video_data = result['annotated_video'].split(',')[1]
            video_bytes = base64.b64decode(video_data)
            
            with open(output_path, 'wb') as f:
                f.write(video_bytes)
            
            print(f"\n💾 Annotated video saved: {output_path}")
            print(f"   Size: {len(video_bytes) / 1024 / 1024:.2f} MB")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.json())

def main():
    print("\n" + "="*60)
    print("🚀 MyVision API Test Suite")
    print("="*60)
    
    # Test health first
    if not test_health():
        print("\n❌ API is not healthy. Please check if:")
        print("  1. Server is running (python start_backend.py)")
        print("  2. Models are in backend/models/ folder")
        return
    
    print("\n" + "="*60)
    print("📋 Test Options:")
    print("="*60)
    print("1. Test with your own image")
    print("2. Test with your own video")
    print("3. Run both tests")
    print("0. Exit")
    
    choice = input("\nEnter your choice (0-3): ").strip()
    
    if choice == '1':
        image_path = input("Enter image path: ").strip()
        confidence = input("Enter confidence threshold (default 0.5): ").strip() or "0.5"
        test_image_detection(image_path, float(confidence))
    
    elif choice == '2':
        video_path = input("Enter video path: ").strip()
        confidence = input("Enter confidence threshold (default 0.4): ").strip() or "0.4"
        sample_rate = input("Enter sample rate (default 5, higher=faster): ").strip() or "5"
        test_video_detection(video_path, float(confidence), int(sample_rate))
    
    elif choice == '3':
        image_path = input("Enter image path: ").strip()
        video_path = input("Enter video path: ").strip()
        
        if os.path.exists(image_path):
            test_image_detection(image_path, 0.5)
        
        if os.path.exists(video_path):
            test_video_detection(video_path, 0.4, 5)
    
    elif choice == '0':
        print("\n👋 Goodbye!")
        return
    
    else:
        print("\n❌ Invalid choice!")
    
    print("\n" + "="*60)
    print("✅ Test Complete!")
    print("="*60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
