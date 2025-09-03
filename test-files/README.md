# Test Files Directory

Thư mục này chứa các file test để kiểm tra tất cả 25 chức năng conversion.

## Các file cần có:

### Image Files:
- `test.png` - File PNG test
- `test.jpg` - File JPG test  
- `test.webp` - File WebP test
- `test.gif` - File GIF test
- `test.bmp` - File BMP test
- `test.tiff` - File TIFF test
- `test.heic` - File HEIC test
- `test.avif` - File AVIF test
- `test.svg` - File SVG test

### Video Files:
- `test.mp4` - File MP4 test

### PDF Files:
- `test.pdf` - File PDF test

## Cách tạo file test:

```bash
# Image files
convert -size 100x100 xc:red test.png
convert -size 100x100 xc:blue test.jpg
convert -size 100x100 xc:green test.webp
convert -size 100x100 xc:yellow test.gif
convert -size 100x100 xc:orange test.bmp
convert -size 100x100 xc:purple test.tiff

# SVG file (simple)
echo '<svg width="100" height="100"><rect width="100" height="100" fill="red"/></svg>' > test.svg

# PDF file (simple)
convert -size 100x100 xc:white test.pdf

# MP4 file (simple video)
# Cần tạo file MP4 thực tế hoặc download từ internet
```

## Test Script:

Sử dụng script `test-all-conversions.sh` để test tất cả chức năng:

```bash
./test-all-conversions.sh
```

## Lưu ý:

- File HEIC, AVIF cần file thực tế (không thể tạo bằng ImageMagick)
- File MP4 cần file video thực tế
- File PDF cần file PDF thực tế
- Một số format có thể cần cài đặt thêm dependencies


