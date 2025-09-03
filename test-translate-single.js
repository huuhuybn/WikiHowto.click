const fs = require('fs');
const path = require('path');

// Cấu hình Gemini API
const GEMINI_API_KEY = 'AIzaSyB-vqzjj-4lejpeoF5zFTLc23o-8Jf_Qhs';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Test với một file và một ngôn ngữ
const TEST_FILE = 'convert-webp-to-jpg.json';
const TEST_LANGUAGE = 'vi'; // Tiếng Việt

// Delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Gửi request đến Gemini API
async function translateWithGemini(text, targetLanguage) {
    if (!GEMINI_API_KEY) {
        throw new Error('Vui lòng thêm GEMINI_API_KEY vào script');
    }

    const prompt = `Translate the following JSON content from English to Vietnamese. 
Keep the JSON structure exactly the same, only translate the text values. 
Keep HTML tags, URLs, and technical terms unchanged. 
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
            throw new Error('Invalid response format from Gemini API');
        }
    } catch (error) {
        console.error(`Error translating to ${targetLanguage}:`, error.message);
        throw error;
    }
}

// Test function
async function testTranslate() {
    if (!GEMINI_API_KEY) {
        console.error('❌ Vui lòng thêm GEMINI_API_KEY vào script');
        return;
    }

    console.log('🧪 Testing translation with single file...');
    
    const sourceFilePath = path.join(__dirname, 'locales', 'en', 'image', TEST_FILE);
    
    if (!fs.existsSync(sourceFilePath)) {
        console.error(`❌ File not found: ${sourceFilePath}`);
        return;
    }

    try {
        // Đọc file gốc
        console.log(`📖 Reading file: ${TEST_FILE}`);
        const sourceData = JSON.parse(fs.readFileSync(sourceFilePath, 'utf8'));
        
        // Cập nhật lang và lang_name
        const translatedData = {
            ...sourceData,
            lang: TEST_LANGUAGE,
            lang_name: 'Vietnamese'
        };
        
        // Chuyển đổi thành JSON string để dịch
        const jsonString = JSON.stringify(translatedData, null, 2);
        
        console.log('🔄 Sending to Gemini API...');
        
        // Delay trước khi gửi request
        await delay(4000);
        
        // Dịch bằng Gemini API
        const translatedJsonString = await translateWithGemini(jsonString, TEST_LANGUAGE);
        
        console.log('📝 Parsing response...');
        
        // Parse lại JSON đã dịch
        const translatedDataParsed = JSON.parse(translatedJsonString);
        
        // Tạo đường dẫn file đích
        const targetFilePath = path.join(__dirname, 'locales', TEST_LANGUAGE, 'image', TEST_FILE);
        
        // Tạo thư mục nếu chưa có
        const targetDir = path.dirname(targetFilePath);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Ghi file đã dịch
        fs.writeFileSync(targetFilePath, JSON.stringify(translatedDataParsed, null, 2), 'utf8');
        
        console.log(`✅ Success! Created: ${targetFilePath}`);
        
        // Hiển thị một số trường đã dịch
        console.log('\n📋 Sample translated fields:');
        console.log(`Title: ${translatedDataParsed.title}`);
        console.log(`Sub title: ${translatedDataParsed.sub_title}`);
        console.log(`Hint: ${translatedDataParsed.hint}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Chạy test
testTranslate().catch(console.error);
