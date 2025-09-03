const fs = require('fs');
const path = require('path');

const ROOT = 'locales';
const SOURCE_DIR = path.join(ROOT, 'en', 'image');

// Danh sách file bị lỗi từ báo cáo trước
const FAILED_FILES = [
    'am/convert-avif-to-png.json',
    'am/convert-bmp-to-ico.json',
    'am/convert-bmp-to-png.json',
    'am/convert-gif-to-png.json',
    'am/convert-jpg-to-avif.json',
    'am/convert-jpg-to-bmp.json',
    'am/convert-jpg-to-ico.json',
    'am/convert-jpg-to-png.json',
    'am/convert-jpg-to-tiff.json',
    'am/convert-jpg-to-webp.json',
    'am/convert-png-to-avif.json',
    'am/convert-bmp-to-png.json',
    'am/convert-png-to-ico.json',
    'am/convert-png-to-jpg.json',
    'am/convert-png-to-tiff.json',
    'am/convert-png-to-webp.json',
    'am/convert-svg-to-ico.json',
    'am/convert-svg-to-png.json',
    'am/convert-tiff-to-ico.json',
    'am/convert-tiff-to-jpg.json',
    'am/convert-webp-to-ico.json',
    'am/convert-webp-to-jpg.json',
    'am/convert-webp-to-png.json',
    'lv/convert-heic-to-jpg.json',
    'te/convert-jpg-to-png.json',
    'ur/converter.json'
];

function getLangName(langCode) {
    const langNames = {
        'am': 'Amharic',
        'lv': 'Latvian',
        'te': 'Telugu',
        'ur': 'Urdu'
    };
    return langNames[langCode] || langCode;
}

function main() {
    console.log('🔧 Fix các file JSON bị lỗi bằng cách COPY và UPDATE lang...\n');
    console.log(`📊 Tổng số file cần fix: ${FAILED_FILES.length}\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < FAILED_FILES.length; i++) {
        const failedFile = FAILED_FILES[i];
        const [langCode, filename] = failedFile.split('/');
        
        console.log(`[${i + 1}/${FAILED_FILES.length}] 🌍 ${langCode}: ${filename}`);
        
        const sourcePath = path.join(SOURCE_DIR, filename);
        const targetDir = path.join(ROOT, langCode, 'image');
        const targetPath = path.join(targetDir, filename);
        
        // Tạo thư mục nếu chưa có
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        try {
            // Đọc file nguồn
            const sourceContent = fs.readFileSync(sourcePath, 'utf8');
            const sourceJson = JSON.parse(sourceContent);
            
            // Copy toàn bộ nội dung và chỉ thay đổi lang
            const targetJson = { ...sourceJson };
            targetJson.lang = langCode;
            targetJson.lang_name = getLangName(langCode);
            
            // Ghi file đích
            fs.writeFileSync(targetPath, JSON.stringify(targetJson, null, 2), 'utf8');
            console.log(`  ✅ Thành công: ${filename} (copy + update lang)`);
            successCount++;
            
        } catch (error) {
            console.log(`  ❌ Lỗi: ${error.message}`);
            errorCount++;
        }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 KẾT QUẢ FIX FILE LỖI');
    console.log('='.repeat(60));
    console.log(`✅ Thành công: ${successCount}`);
    console.log(`❌ Lỗi: ${errorCount}`);
    console.log(`📊 Tỷ lệ thành công: ${((successCount / FAILED_FILES.length) * 100).toFixed(1)}%`);
    
    if (successCount > 0) {
        console.log('\n💡 Các file đã được tạo với nội dung tiếng Anh và lang code đúng.');
        console.log('   Bạn có thể dịch thủ công sau hoặc sử dụng tool khác.');
    }
}

main().catch(console.error);
