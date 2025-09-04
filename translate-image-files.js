const fs = require('fs');
const path = require('path');

// Cấu hình Gemini API
const GEMINI_API_KEY = 'AIzaSyB-vqzjj-4lejpeoF5zFTLc23o-8Jf_Qhs'; // Thêm API key vào đây
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Danh sách ngôn ngữ cần dịch (trừ tiếng Anh)
const LANGUAGES = [
    'vi', 'zh-CN', 'zh-TW', 'id', 'fr', 'de', 'es', 'it', 'pt', 'ru', 
    'ja', 'ko', 'ar', 'hi', 'th', 'tr', 'nl', 'pl', 'sv', 'da', 'no', 
    'fi', 'cs', 'hu', 'ro', 'bg', 'hr', 'sk', 'sl', 'et', 'lv', 'lt', 
    'el', 'he', 'fa', 'ur', 'bn', 'ta', 'te', 'sw', 'ms', 'jv', 'am', 
    'ca', 'sq', 'sr', 'uk'
];

// Mapping tên ngôn ngữ
const LANGUAGE_NAMES = {
    'vi': 'Vietnamese',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'id': 'Indonesian',
    'fr': 'French',
    'de': 'German',
    'es': 'Spanish',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'th': 'Thai',
    'tr': 'Turkish',
    'nl': 'Dutch',
    'pl': 'Polish',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'cs': 'Czech',
    'hu': 'Hungarian',
    'ro': 'Romanian',
    'bg': 'Bulgarian',
    'hr': 'Croatian',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'et': 'Estonian',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'el': 'Greek',
    'he': 'Hebrew',
    'fa': 'Persian',
    'ur': 'Urdu',
    'bn': 'Bengali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'sw': 'Swahili',
    'ms': 'Malay',
    'jv': 'Javanese',
    'am': 'Amharic',
    'ca': 'Catalan',
    'sq': 'Albanian',
    'sr': 'Serbian',
    'uk': 'Ukrainian'
};

// Delay function để tránh rate limit
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Gửi request đến Gemini API
async function translateWithGemini(text, targetLanguage) {
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
        
        // Dịch bằng Gemini API
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
        const targetFilePath = sourceFilePath.replace('/en/image/', `/${targetLanguage}/image/`);
        
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

    console.log('🚀 Bắt đầu dịch các file JSON từ tiếng Anh...');
    console.log(`📁 Sẽ dịch sang ${LANGUAGES.length} ngôn ngữ`);
    
    // Đọc danh sách file trong thư mục en/image
    const enImageDir = path.join(__dirname, 'locales', 'en', 'image');
    const files = fs.readdirSync(enImageDir).filter(file => file.endsWith('.json'));
    
    console.log(`📄 Tìm thấy ${files.length} file JSON trong en/image`);
    
    let totalFiles = files.length * LANGUAGES.length;
    let processedFiles = 0;
    let successCount = 0;
    let errorCount = 0;
    
    // Dịch từng file
    for (const file of files) {
        const sourceFilePath = path.join(enImageDir, file);
        console.log(`\n📝 Processing: ${file}`);
        
        // Dịch sang từng ngôn ngữ
        for (const lang of LANGUAGES) {
            processedFiles++;
            console.log(`\n[${processedFiles}/${totalFiles}] Translating ${file} to ${lang}...`);
            
            const success = await translateFile(sourceFilePath, lang);
            
            if (success) {
                successCount++;
            } else {
                errorCount++;
            }
            
            // Delay để tránh rate limit (4 giây giữa các request)
            if (processedFiles < totalFiles) {
                console.log('⏳ Waiting 4 seconds...');
                await delay(4000);
            }
        }
    }
    
    console.log('\n🎉 Hoàn thành!');
    console.log(`✅ Success: ${successCount} files`);
    console.log(`❌ Errors: ${errorCount} files`);
    console.log(`📊 Total processed: ${processedFiles} files`);
}

// Chạy script
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { translateFile, translateWithGemini };
