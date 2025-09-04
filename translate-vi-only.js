const fs = require('fs');
const path = require('path');

// Cấu hình Gemini API
const GEMINI_API_KEY = 'AIzaSyB-vqzjj-4lejpeoF5zFTLc23o-8Jf_Qhs'; // Thêm API key vào đây
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Thư mục nguồn và đích
const SOURCE_DIR = 'locales/en/image';
const TARGET_LANG = 'vi';
const TARGET_DIR = `locales/${TARGET_LANG}/image`;

// Đảm bảo thư mục đích tồn tại
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    console.log(`✅ Tạo thư mục: ${TARGET_DIR}`);
}

// Hàm delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Hàm dịch bằng Gemini API
async function translateWithGemini(text, targetLang) {
    if (!GEMINI_API_KEY) {
        throw new Error('❌ Vui lòng thêm GEMINI_API_KEY vào script');
    }

    const prompt = `Translate the following JSON content from English to ${targetLang}. 
Return ONLY the raw JSON without any markdown formatting, code blocks, or explanations:

${text}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('❌ Không nhận được phản hồi hợp lệ từ API');
        }
    } catch (error) {
        throw new Error(`❌ Lỗi API: ${error.message}`);
    }
}

// Hàm dịch file JSON
async function translateJsonFile(filePath, targetPath) {
    try {
        console.log(`\n📄 Đang dịch: ${path.basename(filePath)}`);
        
        // Đọc file nguồn
        const sourceContent = fs.readFileSync(filePath, 'utf8');
        const sourceJson = JSON.parse(sourceContent);
        
        // Dịch nội dung
        console.log('🔄 Đang gửi yêu cầu dịch...');
        const translatedText = await translateWithGemini(sourceContent, 'Vietnamese');
        
        // Parse JSON đã dịch
        const translatedJson = JSON.parse(translatedText);
        
        // Ghi file đích
        fs.writeFileSync(targetPath, JSON.stringify(translatedJson, null, 2), 'utf8');
        
        console.log(`✅ Đã dịch thành công: ${path.basename(filePath)}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Lỗi khi dịch ${path.basename(filePath)}: ${error.message}`);
        return false;
    }
}

// Hàm chính
async function translateAllFiles() {
    if (!GEMINI_API_KEY) {
        console.error('❌ Vui lòng thêm GEMINI_API_KEY vào script');
        return;
    }

    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`❌ Thư mục nguồn không tồn tại: ${SOURCE_DIR}`);
        return;
    }

    // Lấy danh sách file JSON
    const files = fs.readdirSync(SOURCE_DIR)
        .filter(file => file.endsWith('.json'))
        .sort();

    console.log(`🚀 Bắt đầu dịch ${files.length} file từ ${SOURCE_DIR} sang ${TARGET_DIR}`);
    console.log(`📊 Ngôn ngữ đích: ${TARGET_LANG}`);
    console.log(`⏱️  Delay: 4 giây giữa các request\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        const sourcePath = path.join(SOURCE_DIR, fileName);
        const targetPath = path.join(TARGET_DIR, fileName);

        console.log(`\n[${i + 1}/${files.length}] ${fileName}`);

        const success = await translateJsonFile(sourcePath, targetPath);
        
        if (success) {
            successCount++;
        } else {
            errorCount++;
        }

        // Delay giữa các request (trừ request cuối)
        if (i < files.length - 1) {
            console.log('⏳ Waiting 4 seconds...');
            await delay(4000);
        }
    }

    // Thống kê kết quả
    console.log('\n' + '='.repeat(50));
    console.log('📊 THỐNG KÊ KẾT QUẢ:');
    console.log(`✅ Thành công: ${successCount} file`);
    console.log(`❌ Lỗi: ${errorCount} file`);
    console.log(`📁 Tổng cộng: ${files.length} file`);
    console.log(`🎯 Ngôn ngữ: ${TARGET_LANG}`);
    console.log('='.repeat(50));
}

// Chạy script
translateAllFiles().catch(console.error);
