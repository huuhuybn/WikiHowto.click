const fs = require('fs');
const path = require('path');

// Danh sách các file *-to-ico.json cần tạo lại
const icoFiles = [
    'convert-bmp-to-ico.json',
    'convert-jpg-to-ico.json', 
    'convert-png-to-ico.json',
    'convert-svg-to-ico.json',
    'convert-tiff-to-ico.json',
    'convert-webp-to-ico.json'
];

// Danh sách các ngôn ngữ (trừ tiếng Anh)
const languages = [
    'am', 'ar', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'es', 'et', 'fa', 'fi', 'fr', 'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'jv', 'ko', 'lt', 'lv', 'ms', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'sq', 'sr', 'sv', 'sw', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'vi', 'zh-CN', 'zh-TW'
];

// Hàm copy file từ tiếng Anh sang ngôn ngữ khác
function copyIcoFile(lang, icoFile) {
    const sourcePath = `locales/en/image/${icoFile}`;
    const targetPath = `locales/${lang}/image/${icoFile}`;
    
    // Kiểm tra file gốc có tồn tại không
    if (!fs.existsSync(sourcePath)) {
        console.log(`❌ Source file not found: ${sourcePath}`);
        return false;
    }
    
    // Đảm bảo thư mục đích tồn tại
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    
    try {
        // Đọc file gốc
        const sourceContent = fs.readFileSync(sourcePath, 'utf8');
        const sourceData = JSON.parse(sourceContent);
        
        // Cập nhật lang field
        sourceData.lang = lang;
        
        // Ghi file đích
        const targetContent = JSON.stringify(sourceData, null, 2);
        fs.writeFileSync(targetPath, targetContent, 'utf8');
        
        console.log(`✅ Created: ${targetPath}`);
        return true;
    } catch (error) {
        console.log(`❌ Error creating ${targetPath}: ${error.message}`);
        return false;
    }
}

// Main execution
console.log('🔄 Regenerating *-to-ico.json files...\n');

let successCount = 0;
let totalCount = 0;

for (const lang of languages) {
    for (const icoFile of icoFiles) {
        totalCount++;
        if (copyIcoFile(lang, icoFile)) {
            successCount++;
        }
    }
}

console.log(`\n📊 Summary:`);
console.log(`Total files to create: ${totalCount}`);
console.log(`Successfully created: ${successCount}`);
console.log(`Failed: ${totalCount - successCount}`);

if (successCount === totalCount) {
    console.log('\n🎉 All *-to-ico.json files regenerated successfully!');
} else {
    console.log('\n❌ Some files failed to regenerate.');
    process.exit(1);
}
