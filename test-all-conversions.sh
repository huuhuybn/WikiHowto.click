#!/bin/bash

echo "=== TEST TẤT CẢ 25 CHỨC NĂNG CONVERSION ==="
echo ""

# Test function
test_conversion() {
    local test_name="$1"
    local file="$2"
    local type="$3"
    echo "Testing: $test_name"
    result=$(curl -X POST http://localhost:3012/convert -F "files=@test-files/$file" -F "type=$type" -F "lang=en" -s -w "HTTP Status: %{http_code}" | grep "HTTP Status" | cut -d' ' -f3)
    if [ "$result" = "200" ]; then
        echo "✅ PASS: $test_name"
    else
        echo "❌ FAIL: $test_name (Status: $result)"
    fi
    echo ""
}

# Image conversions
test_conversion "1. PNG to JPG" "test.png" "png-to-jpg"
test_conversion "2. JPG to PNG" "test.jpg" "jpg-to-png"
test_conversion "3. PNG to WebP" "test.png" "png-to-webp"
test_conversion "4. JPG to WebP" "test.jpg" "jpg-to-webp"
test_conversion "5. WebP to PNG" "test.webp" "webp-to-png"
test_conversion "6. WebP to JPG" "test.webp" "webp-to-jpg"
test_conversion "7. GIF to PNG" "test.gif" "gif-to-png"
test_conversion "8. PNG to GIF" "test.png" "png-to-gif"
test_conversion "9. JPG to GIF" "test.jpg" "jpg-to-gif"
test_conversion "10. BMP to PNG" "test.bmp" "bmp-to-png"
test_conversion "11. TIFF to JPG" "test.tiff" "tiff-to-jpg"
test_conversion "12. HEIC to JPG" "test.heic" "heic-to-jpg"
test_conversion "13. AVIF to PNG" "test.avif" "avif-to-png"

# ICO conversions
test_conversion "14. PNG to ICO" "test.png" "png-to-ico"
test_conversion "15. JPG to ICO" "test.jpg" "jpg-to-ico"
test_conversion "16. SVG to ICO" "test.svg" "svg-to-ico"

# PDF conversions
test_conversion "17. JPG to PDF" "test.jpg" "jpg-to-pdf"
test_conversion "18. PNG to PDF" "test.png" "png-to-pdf"
test_conversion "19. PDF to JPG" "test.pdf" "pdf-to-jpg"
test_conversion "20. PDF to PNG" "test.pdf" "pdf-to-png"

# Merge/Combine PDF
test_conversion "21. Merge JPG to PDF" "test.jpg" "merge-jpg-to-pdf"
test_conversion "22. Combine PNG to PDF" "test.png" "combine-png-to-pdf"

# Video conversions
test_conversion "23. GIF to MP4" "test.gif" "gif-to-mp4"
test_conversion "24. MP4 to GIF" "test.mp4" "mp4-to-gif"

# Generic conversions
test_conversion "25. Image to PDF" "test.jpg" "image-to-pdf"

echo "=== KẾT QUẢ TỔNG HỢP ==="
echo "Tổng số test: 25"
echo "PASS: $(grep -c '✅ PASS' /tmp/test_results 2>/dev/null || echo '0')"
echo "FAIL: $(grep -c '❌ FAIL' /tmp/test_results 2>/dev/null || echo '0')"
