# Translation Scripts for MiConvert

Scripts để dịch các file JSON từ tiếng Anh sang các ngôn ngữ khác sử dụng Gemini API.

## Files

- `translate-image-files.js` - Script chính để dịch tất cả file JSON
- `test-translate-single.js` - Script test để dịch một file duy nhất
- `TRANSLATION_README.md` - File hướng dẫn này

## Cài đặt

1. **Thêm API Key**: Mở file script và thêm Gemini API key vào biến `GEMINI_API_KEY`:
   ```javascript
   const GEMINI_API_KEY = 'your-api-key-here';
   ```

2. **Cài đặt Node.js**: Đảm bảo bạn đã cài đặt Node.js (version 16+)

## Sử dụng

### Test với một file duy nhất

Trước khi chạy script chính, hãy test với một file duy nhất:

```bash
node test-translate-single.js
```

Script này sẽ:
- Dịch file `convert-webp-to-jpg.json` sang tiếng Việt
- Tạo file `locales/vi/image/convert-webp-to-jpg.json`
- Hiển thị kết quả dịch

### Dịch tất cả file

Sau khi test thành công, chạy script chính:

```bash
node translate-image-files.js
```

Script này sẽ:
- Dịch tất cả 26 file JSON trong `locales/en/image/`
- Sang 47 ngôn ngữ khác nhau
- Tạo tổng cộng 1,222 file JSON mới
- Có delay 2 giây giữa các request để tránh rate limit

## Thống kê

- **File gốc**: 26 file trong `locales/en/image/`
- **Ngôn ngữ đích**: 47 ngôn ngữ
- **Tổng file sẽ tạo**: 1,222 file
- **Thời gian ước tính**: ~40 phút (với delay 2s)

## Danh sách ngôn ngữ

Script sẽ dịch sang các ngôn ngữ sau:
- vi (Vietnamese)
- zh-CN (Chinese Simplified)
- zh-TW (Chinese Traditional)
- id (Indonesian)
- fr (French)
- de (German)
- es (Spanish)
- it (Italian)
- pt (Portuguese)
- ru (Russian)
- ja (Japanese)
- ko (Korean)
- ar (Arabic)
- hi (Hindi)
- th (Thai)
- tr (Turkish)
- nl (Dutch)
- pl (Polish)
- sv (Swedish)
- da (Danish)
- no (Norwegian)
- fi (Finnish)
- cs (Czech)
- hu (Hungarian)
- ro (Romanian)
- bg (Bulgarian)
- hr (Croatian)
- sk (Slovak)
- sl (Slovenian)
- et (Estonian)
- lv (Latvian)
- lt (Lithuanian)
- el (Greek)
- he (Hebrew)
- fa (Persian)
- ur (Urdu)
- bn (Bengali)
- ta (Tamil)
- te (Telugu)
- sw (Swahili)
- ms (Malay)
- jv (Javanese)
- am (Amharic)
- ca (Catalan)
- sq (Albanian)
- sr (Serbian)
- uk (Ukrainian)

## Cấu trúc file

Mỗi file JSON sẽ được dịch với cấu trúc:
```json
{
  "lang": "vi",
  "lang_name": "Vietnamese",
  "title": "Dịch từ tiếng Anh",
  "sub_title": "Dịch từ tiếng Anh",
  // ... các trường khác
}
```

## Lưu ý

1. **Rate Limit**: Script có delay 2 giây giữa các request để tránh bị limit bởi Gemini API
2. **HTML Tags**: Script sẽ giữ nguyên HTML tags, URLs và technical terms
3. **JSON Structure**: Cấu trúc JSON sẽ được giữ nguyên, chỉ dịch text values
4. **Error Handling**: Script sẽ log lỗi và tiếp tục với file tiếp theo
5. **Backup**: Nên backup dữ liệu trước khi chạy script

## Troubleshooting

### Lỗi API Key
```
❌ Vui lòng thêm GEMINI_API_KEY vào script
```
**Giải pháp**: Thêm API key vào biến `GEMINI_API_KEY`

### Lỗi Rate Limit
```
HTTP error! status: 429
```
**Giải pháp**: Tăng delay trong script (thay đổi `delay(2000)` thành `delay(5000)`)

### Lỗi Parse JSON
```
Error parsing translated JSON
```
**Giải pháp**: Kiểm tra response từ Gemini API, có thể cần điều chỉnh prompt

## Monitoring

Script sẽ hiển thị:
- Tiến độ dịch: `[1/1222] Translating file.json to vi...`
- Kết quả thành công: `✅ Created: locales/vi/image/file.json`
- Lỗi: `❌ Failed to translate file.json to vi: error message`
- Thống kê cuối: `✅ Success: 1200 files, ❌ Errors: 22 files`



