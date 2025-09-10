# Image Converter API - Hướng dẫn sử dụng

## 📋 Tổng quan
Image Converter API đã được tích hợp vào dự án chính với đầy đủ chức năng chuyển đổi ảnh đơn lẻ và hàng loạt.

## 🚀 Cài đặt và chạy

### 1. Dependencies đã được cài đặt:
```bash
npm install sharp multer archiver cors
```

### 2. Khởi động server:
```bash
npm start
# hoặc
npm run dev
```

## 🔗 API Endpoints

### Base URL: `/image-converter`

### 1. Lấy danh sách định dạng hỗ trợ
```
GET /image-converter/formats
```

**Response:**
```json
{
  "inputFormats": [
    {
      "format": "JPEG",
      "mimeType": "image/jpeg",
      "extensions": [".jpg", ".jpeg", ".jpe", ".jfif"]
    },
    // ... các định dạng khác
  ],
  "outputFormats": [
    {
      "format": "PNG",
      "extension": ".png",
      "description": "Lossless compression, supports transparency"
    }
    // ... các định dạng khác
  ]
}
```

### 2. Chuyển đổi ảnh đơn lẻ
```
POST /image-converter/convert-single
```

**Parameters:**
- `file` (multipart/form-data): File ảnh cần chuyển đổi
- `format` (string): Định dạng đầu ra (png, jpg, webp, gif, tiff, avif)

**Response:** File ảnh đã chuyển đổi (download)

### 3. Chuyển đổi nhiều ảnh (batch)
```
POST /image-converter/convert-batch
```

**Parameters:**
- `files` (multipart/form-data): Nhiều file ảnh
- `format` (string): Định dạng đầu ra

**Response:** File ZIP chứa tất cả ảnh đã chuyển đổi

## 🧪 Test API

### Sử dụng file test HTML:
1. Mở file `test-image-converter.html` trong browser
2. Test các chức năng:
   - Lấy danh sách định dạng
   - Chuyển đổi ảnh đơn lẻ
   - Chuyển đổi nhiều ảnh

### Sử dụng cURL:

#### Test lấy formats:
```bash
curl http://localhost:3000/image-converter/formats
```

#### Test convert single image:
```bash
curl -X POST \
  -F "file=@test-image.jpg" \
  -F "format=png" \
  http://localhost:3000/image-converter/convert-single \
  --output converted-image.png
```

#### Test batch conversion:
```bash
curl -X POST \
  -F "files=@image1.jpg" \
  -F "files=@image2.png" \
  -F "format=webp" \
  http://localhost:3000/image-converter/convert-batch \
  --output converted-images.zip
```

## 📁 Cấu trúc file

```
MiConvert/
├── routes/
│   └── image-converter.js    # Route chính cho image converter
├── uploads/                  # Thư mục lưu file tạm
├── test-image-converter.html # File test API
├── supported-formats.md      # Danh sách định dạng hỗ trợ
└── IMAGE-CONVERTER-README.md # File này
```

## ⚙️ Cấu hình

### Giới hạn file:
- **Kích thước file tối đa:** 16MB
- **Số file batch tối đa:** 50 files
- **Kích thước file xử lý:** 10MB/file

### Định dạng hỗ trợ:

#### Input (đọc được):
- JPEG (.jpg, .jpeg, .jpe, .jfif)
- PNG (.png)
- WEBP (.webp)
- TIFF (.tif, .tiff)
- GIF (.gif)
- SVG (.svg, .svgz)
- HEIF/AVIF (.heif, .avif)

#### Output (xuất được):
- PNG
- JPEG
- WEBP
- TIFF
- GIF
- HEIF/AVIF

## 🔧 Tích hợp vào giao diện EJS

### 1. Thêm route vào trang chính:
```javascript
// Trong routes/index.js
router.get('/image-converter', (req, res) => {
    res.render('image-converter', {
        title: 'Image Converter',
        supportedFormats: ['PNG', 'JPEG', 'WEBP', 'GIF', 'TIFF', 'AVIF']
    });
});
```

### 2. Tạo view EJS:
```ejs
<!-- views/image-converter.ejs -->
<%- include('header') %>

<div class="container">
    <h1>Image Converter</h1>
    <!-- Form upload và convert -->
</div>

<%- include('footer') %>
```

### 3. Thêm JavaScript cho giao diện:
```javascript
// Xử lý upload và convert
async function convertImage(file, format) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);
    
    const response = await fetch('/image-converter/convert-single', {
        method: 'POST',
        body: formData
    });
    
    if (response.ok) {
        // Download file
        const blob = await response.blob();
        // ... xử lý download
    }
}
```

## 🚨 Lưu ý quan trọng

1. **Bảo mật:** API chỉ chấp nhận file ảnh, đã có validation
2. **Hiệu suất:** Sử dụng memory storage để tối ưu tốc độ
3. **Memory:** Xử lý batch theo chunks để tránh quá tải
4. **Error handling:** Có xử lý lỗi đầy đủ cho mọi trường hợp

## 🔄 Cập nhật trong tương lai

- [ ] Thêm giao diện EJS đẹp
- [ ] Thêm tính năng resize ảnh
- [ ] Thêm tính năng compress ảnh
- [ ] Thêm watermark
- [ ] Thêm crop ảnh
- [ ] Thêm filter effects

## 📞 Hỗ trợ

Nếu có vấn đề, kiểm tra:
1. Console logs của server
2. Network tab trong browser dev tools
3. File logs trong thư mục `logs/`



