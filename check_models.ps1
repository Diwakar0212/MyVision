# Check Models Status Script
# Run this to see which models you have

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  🔍 MyVision - Model Status Checker" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

$modelsPath = "C:\Users\diwakar\Downloads\syn-vision-main (1)\syn-vision-main\backend\models"

Write-Host "📁 Checking models folder: " -NoNewline
Write-Host $modelsPath -ForegroundColor Yellow
Write-Host ""

# Check if folder exists
if (Test-Path $modelsPath) {
    Write-Host "✅ Models folder exists" -ForegroundColor Green
    Write-Host ""
    
    # Check for each model
    $models = @(
        @{name="yolov8m.pt"; required=$true; description="YOLOv8m base model"},
        @{name="traffic_lights.pt"; required=$true; description="Traffic light detection"},
        @{name="zebra_crossing.pt"; required=$true; description="Zebra crossing detection"}
    )
    
    $allPresent = $true
    
    foreach ($model in $models) {
        $modelPath = Join-Path $modelsPath $model.name
        
        if (Test-Path $modelPath) {
            $size = (Get-Item $modelPath).Length
            $sizeMB = [math]::Round($size / 1MB, 2)
            Write-Host "  ✅ " -ForegroundColor Green -NoNewline
            Write-Host "$($model.name)" -ForegroundColor White -NoNewline
            Write-Host " ($sizeMB MB)" -ForegroundColor Gray
            Write-Host "     $($model.description)" -ForegroundColor DarkGray
        } else {
            Write-Host "  ❌ " -ForegroundColor Red -NoNewline
            Write-Host "$($model.name)" -ForegroundColor Yellow -NoNewline
            Write-Host " - MISSING" -ForegroundColor Red
            Write-Host "     $($model.description)" -ForegroundColor DarkGray
            $allPresent = $false
        }
        Write-Host ""
    }
    
    Write-Host "=" * 60 -ForegroundColor Cyan
    
    if ($allPresent) {
        Write-Host ""
        Write-Host "🎉 All models are present!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now:" -ForegroundColor White
        Write-Host "  1. Start the server: " -NoNewline; Write-Host "python -m uvicorn main:app --host 0.0.0.0 --port 8000" -ForegroundColor Cyan
        Write-Host "  2. Test the API: " -NoNewline; Write-Host "python test_api.py" -ForegroundColor Cyan
        Write-Host "  3. Visit: " -NoNewline; Write-Host "http://localhost:8000/docs" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "⚠️  Some models are missing!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📋 Next steps:" -ForegroundColor White
        Write-Host "  1. Download your trained models from Google Colab" -ForegroundColor Gray
        Write-Host "  2. Copy them to: $modelsPath" -ForegroundColor Gray
        Write-Host "  3. Restart the server" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📖 For detailed instructions, read: " -NoNewline
        Write-Host "ADD_MODELS_HERE.md" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "🔧 Quick fix (for testing only):" -ForegroundColor Yellow
        Write-Host "  Use yolov8m.pt as placeholder for missing models:" -ForegroundColor Gray
        Write-Host "  cd backend\models" -ForegroundColor DarkGray
        Write-Host "  copy yolov8m.pt traffic_lights.pt" -ForegroundColor DarkGray
        Write-Host "  copy yolov8m.pt zebra_crossing.pt" -ForegroundColor DarkGray
        Write-Host ""
    }
    
} else {
    Write-Host "❌ Models folder not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Expected location: $modelsPath" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
