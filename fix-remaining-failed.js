const fs = require('fs');
const path = require('path');

// Cấu hình Gemini API
const GEMINI_API_KEY = 'AIzaSyB-vqzjj-4lejpeoF5zFTLc23o-8Jf_Qhs';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Danh sách các ngôn ngữ còn lại bị lỗi
const REMAINING_FAILED_LANGUAGES = [
    'sv', 'cs', 'sk', 'lv', 'he'
];

// Mapping tên ngôn ngữ
const LANGUAGE_NAMES = {
    'sv': 'Swedish',
    'cs': 'Czech',
    'sk': 'Slovak',
    'lv': 'Latvian',
    'he': 'Hebrew'
};

// Delay function với thời gian rất dài
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Gửi request đến Gemini API với retry logic và delay dài
async function translateWithGemini(text, targetLanguage, retries = 5) {
    if (!GEMINI_API_KEY) {
        throw new Error('Vui lòng thêm GEMINI_API_KEY vào script');
    }

    const prompt = `Translate the following JSON content from English to ${LANGUAGE_NAMES[targetLanguage]}. 
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

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`🔄 Attempt ${attempt}/${retries} for ${targetLanguage}...`);
            
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                if (response.status === 429 && attempt < retries) {
                    const waitTime = 30000 + (attempt * 10000); // 30s, 40s, 50s, 60s
                    console.log(`⏳ Rate limited (429), waiting ${waitTime/1000} seconds before retry...`);
                    await delay(waitTime);
                    continue;
                }
                if (response.status === 503 && attempt < retries) {
                    console.log(`⏳ Server busy (503), waiting 20 seconds before retry...`);
                    await delay(20000);
                    continue;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid response format from Gemini API');
            }
        } catch (error) {
            console.error(`❌ Attempt ${attempt} failed for ${targetLanguage}:`, error.message);
            
            if (attempt === retries) {
                throw error;
            }
            
            // Wait even longer before retry
            const waitTime = 30000 + (attempt * 10000);
            console.log(`⏳ Waiting ${waitTime/1000} seconds before retry...`);
            await delay(waitTime);
        }
    }
}

// Đọc file JSON
function readJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        throw error;
    }
}

// Ghi file JSON
function writeJsonFile(filePath, data) {
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Created: ${filePath}`);
    } catch (error) {
        console.error(`Error writing file ${filePath}:`, error.message);
        throw error;
    }
}

// Dịch một file JSON
async function translateFile(sourceFilePath, targetLanguage) {
    try {
        console.log(`\n🔄 Translating ${path.basename(sourceFilePath)} to ${LANGUAGE_NAMES[targetLanguage]}...`);
        
        // Đọc file gốc
        const sourceData = readJsonFile(sourceFilePath);
        
        // Cập nhật lang và lang_name
        const translatedData = {
            ...sourceData,
            lang: targetLanguage,
            lang_name: LANGUAGE_NAMES[targetLanguage]
        };
        
        // Chuyển đổi thành JSON string để dịch
        const jsonString = JSON.stringify(translatedData, null, 2);
        
        // Dịch bằng Gemini API với retry
        const translatedJsonString = await translateWithGemini(jsonString, targetLanguage);
        
        // Parse lại JSON đã dịch
        let translatedDataParsed;
        try {
            translatedDataParsed = JSON.parse(translatedJsonString);
        } catch (parseError) {
            console.error(`❌ Error parsing translated JSON for ${targetLanguage}:`, parseError.message);
            console.log('Raw response:', translatedJsonString);
            throw parseError;
        }
        
        // Tạo đường dẫn file đích
        const targetFilePath = sourceFilePath.replace('/en/home/', `/${targetLanguage}/home/`);
        
        // Ghi file đã dịch
        writeJsonFile(targetFilePath, translatedDataParsed);
        
        return true;
    } catch (error) {
        console.error(`❌ Failed to translate ${path.basename(sourceFilePath)} to ${targetLanguage}:`, error.message);
        return false;
    }
}

// Hàm chính
async function main() {
    if (!GEMINI_API_KEY) {
        console.error('❌ Vui lòng thêm GEMINI_API_KEY vào script');
        return;
    }

    console.log('🚀 Bắt đầu dịch lại các file home.json còn lại...');
    console.log(`📁 Sẽ dịch lại ${REMAINING_FAILED_LANGUAGES.length} ngôn ngữ`);
    
    // Đường dẫn file gốc
    const sourceFilePath = path.join(__dirname, 'locales', 'en', 'home', 'home.json');
    
    if (!fs.existsSync(sourceFilePath)) {
        console.error(`❌ File gốc không tồn tại: ${sourceFilePath}`);
        return;
    }
    
    console.log(`📄 File gốc: ${sourceFilePath}`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Dịch lại từng ngôn ngữ còn lại
    for (let i = 0; i < REMAINING_FAILED_LANGUAGES.length; i++) {
        const lang = REMAINING_FAILED_LANGUAGES[i];
        console.log(`\n[${i + 1}/${REMAINING_FAILED_LANGUAGES.length}] Processing language: ${lang}...`);
        
        const success = await translateFile(sourceFilePath, lang);
        
        if (success) {
            successCount++;
        } else {
            errorCount++;
        }
        
        // Delay rất dài giữa các request (60 giây)
        if (i < REMAINING_FAILED_LANGUAGES.length - 1) {
            console.log('⏳ Waiting 60 seconds...');
            await delay(60000);
        }
    }
    
    console.log('\n🎉 Hoàn thành!');
    console.log(`✅ Success: ${successCount} files`);
    console.log(`❌ Errors: ${errorCount} files`);
    console.log(`📊 Total processed: ${REMAINING_FAILED_LANGUAGES.length} files`);
}

// Chạy script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { translateFile, translateWithGemini };
