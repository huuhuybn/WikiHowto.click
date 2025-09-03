const fs = require('fs');
const path = require('path');

// Cấu hình Gemini API
const GEMINI_API_KEY = 'AIzaSyB-vqzjj-4lejpeoF5zFTLc23o-8Jf_Qhs';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Danh sách file bị lỗi
const FAILED_FILES = [
    'convert-jpg-to-bmp.json',
    'convert-webp-to-avif.json', 
    'convert-webp-to-ico.json',
    'converter.json'
];

// Thư mục nguồn và đích
const SOURCE_DIR = 'locales/en/image';
const TARGET_DIR = 'locales/es/image';

// Hàm delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Hàm dịch bằng Gemini API
async function translateWithGemini(text, targetLang) {
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
async function translateJsonFile(fileName) {
    try {
        console.log(`\n📄 Đang dịch lại: ${fileName}`);
        
        const sourcePath = path.join(SOURCE_DIR, fileName);
        const targetPath = path.join(TARGET_DIR, fileName);
        
        // Đọc file nguồn
        const sourceContent = fs.readFileSync(sourcePath, 'utf8');
        console.log('📖 Đã đọc file nguồn');
        
        // Dịch nội dung
        console.log('🔄 Đang gửi yêu cầu dịch...');
        const translatedText = await translateWithGemini(sourceContent, 'Spanish');
        
        console.log('📝 Đã nhận phản hồi từ API, đang parse JSON...');
        
        // Parse JSON đã dịch
        const translatedJson = JSON.parse(translatedText);
        
        // Ghi file đích
        fs.writeFileSync(targetPath, JSON.stringify(translatedJson, null, 2), 'utf8');
        
        console.log(`✅ Đã dịch thành công: ${fileName}`);
        return true;
        
    } catch (error) {
        console.error(`❌ Lỗi khi dịch ${fileName}: ${error.message}`);
        return false;
    }
}

// Hàm chính
async function retryFailedFiles() {
    console.log('🔄 Thử dịch lại các file bị lỗi cho tiếng Tây Ban Nha...');
    console.log(`📋 Danh sách file cần dịch lại: ${FAILED_FILES.length} file\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < FAILED_FILES.length; i++) {
        const fileName = FAILED_FILES[i];
        
        console.log(`\n[${i + 1}/${FAILED_FILES.length}] ${fileName}`);

        const success = await translateJsonFile(fileName);
        
        if (success) {
            successCount++;
        } else {
            errorCount++;
        }

        // Delay giữa các request (trừ request cuối)
        if (i < FAILED_FILES.length - 1) {
            console.log('⏳ Waiting 10 seconds...');
            await delay(10000);
        }
    }

    // Thống kê kết quả
    console.log('\n' + '='.repeat(50));
    console.log('📊 THỐNG KÊ KẾT QUẢ:');
    console.log(`✅ Thành công: ${successCount} file`);
    console.log(`❌ Lỗi: ${errorCount} file`);
    console.log(`📁 Tổng cộng: ${FAILED_FILES.length} file`);
    console.log(`🎯 Ngôn ngữ: es`);
    console.log('='.repeat(50));
}

// Chạy script
retryFailedFiles().catch(console.error);
