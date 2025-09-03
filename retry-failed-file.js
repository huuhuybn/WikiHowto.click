const fs = require('fs');
const path = require('path');

// Cấu hình Gemini API
const GEMINI_API_KEY = 'AIzaSyB-vqzjj-4lejpeoF5zFTLc23o-8Jf_Qhs';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// File cần dịch lại
const SOURCE_FILE = 'locales/en/image/convert-jpg-to-bmp.json';
const TARGET_FILE = 'locales/vi/image/convert-jpg-to-bmp.json';

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
async function translateJsonFile() {
    try {
        console.log(`\n📄 Đang dịch lại: convert-jpg-to-bmp.json`);
        
        // Đọc file nguồn
        const sourceContent = fs.readFileSync(SOURCE_FILE, 'utf8');
        console.log('📖 Đã đọc file nguồn');
        
        // Dịch nội dung
        console.log('🔄 Đang gửi yêu cầu dịch...');
        const translatedText = await translateWithGemini(sourceContent, 'Vietnamese');
        
        console.log('📝 Đã nhận phản hồi từ API, đang parse JSON...');
        
        // Parse JSON đã dịch
        const translatedJson = JSON.parse(translatedText);
        
        // Ghi file đích
        fs.writeFileSync(TARGET_FILE, JSON.stringify(translatedJson, null, 2), 'utf8');
        
        console.log(`✅ Đã dịch thành công: convert-jpg-to-bmp.json`);
        return true;
        
    } catch (error) {
        console.error(`❌ Lỗi khi dịch: ${error.message}`);
        
        // Nếu lỗi JSON parsing, hiển thị phần đầu của response
        if (error.message.includes('JSON')) {
            console.log('\n🔍 Debug: Phần đầu của response từ API:');
            console.log(translatedText.substring(0, 500) + '...');
        }
        
        return false;
    }
}

// Chạy script
console.log('🔄 Thử dịch lại file bị lỗi...');
translateJsonFile().catch(console.error);
