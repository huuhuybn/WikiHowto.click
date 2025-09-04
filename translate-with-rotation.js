const fs = require('fs');
const path = require('path');

// Cấu hình Gemini API - 2 keys luân phiên
const GEMINI_API_KEYS = [
    'AIzaSyB-vqzjj-4lejpeoF5zFTLc23o-8Jf_Qhs',
    'AIzaSyBomJwcxWIlFmck556XBppbvbNbEic6d0Y',
    'AIzaSyD3NQSTBvMLw9FHXU0LdiZYsVk2IZNn8XU',
    'AIzaSyDuosywDrALdV9hUElWbuAgn_DsgU3_AG8'
];
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Thư mục nguồn
const SOURCE_DIR = 'locales/en/image';

// Danh sách ngôn ngữ phổ biến (trừ en, vi, es đã có)
const LANGUAGES = [
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh-CN', name: 'Chinese (Simplified)' },
    { code: 'zh-TW', name: 'Chinese (Traditional)' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'th', name: 'Thai' },
    { code: 'id', name: 'Indonesian' },
    { code: 'nl', name: 'Dutch' },
    { code: 'pl', name: 'Polish' }
];

// Biến để theo dõi key hiện tại
let currentKeyIndex = 0;

// Hàm delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Hàm lấy API key tiếp theo (luân phiên) và index để log
function getNextApiKey() {
    const index = currentKeyIndex;
    const key = GEMINI_API_KEYS[index];
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
    return { key, index };
}

// Hàm dịch bằng Gemini API với retry
async function translateWithGemini(text, targetLang, retryCount = 0) {
    const maxRetries = 3;
    const { key: apiKey, index: apiIdx } = getNextApiKey();
    
    const prompt = `Translate the following JSON content from English to ${targetLang}. \nReturn ONLY the raw JSON without any markdown formatting, code blocks, or explanations:\n\n${text}`;

    const requestBody = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }]
    };

    try {
        console.log(`🔑 Sử dụng API key #${apiIdx + 1}/${GEMINI_API_KEYS.length}...`);
        
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            if (response.status === 429 && retryCount < maxRetries) {
                console.log(`⚠️ Rate limit, thử lại với key khác... (${retryCount + 1}/${maxRetries})`);
                await delay(5000); // Chờ 5 giây trước khi thử lại
                return translateWithGemini(text, targetLang, retryCount + 1);
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('❌ Không nhận được phản hồi hợp lệ từ API');
        }
    } catch (error) {
        if (retryCount < maxRetries) {
            console.log(`⚠️ Lỗi, thử lại... (${retryCount + 1}/${maxRetries})`);
            await delay(3000);
            return translateWithGemini(text, targetLang, retryCount + 1);
        }
        throw new Error(`❌ Lỗi API: ${error.message}`);
    }
}

// Hàm dịch file JSON
async function translateJsonFile(filePath, targetPath, langName) {
    try {
        console.log(`\n📄 Đang dịch: ${path.basename(filePath)} (${langName})`);
        
        // Đọc file nguồn
        const sourceContent = fs.readFileSync(filePath, 'utf8');
        
        // Dịch nội dung
        console.log('🔄 Đang gửi yêu cầu dịch...');
        const translatedText = await translateWithGemini(sourceContent, langName);
        
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

// Hàm dịch tất cả file cho một ngôn ngữ
async function translateLanguage(lang) {
    const targetDir = `locales/${lang.code}/image`;
    
    // Đảm bảo thư mục đích tồn tại
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`✅ Tạo thư mục: ${targetDir}`);
    }

    // Lấy danh sách file JSON
    const files = fs.readdirSync(SOURCE_DIR)
        .filter(file => file.endsWith('.json'))
        .sort();

    console.log(`\n🚀 Bắt đầu dịch ${files.length} file cho ${lang.name} (${lang.code})`);
    console.log(`📁 Thư mục đích: ${targetDir}`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < files.length; i++) {
        const fileName = files[i];
        const sourcePath = path.join(SOURCE_DIR, fileName);
        const targetPath = path.join(targetDir, fileName);

        console.log(`\n[${i + 1}/${files.length}] ${fileName}`);

        const success = await translateJsonFile(sourcePath, targetPath, lang.name);
        
        if (success) {
            successCount++;
        } else {
            errorCount++;
        }

        // Delay giữa các request (trừ request cuối)
        if (i < files.length - 1) {
            console.log('⏳ Waiting 3 seconds...');
            await delay(3000);
        }
    }

    console.log(`\n📊 ${lang.name} (${lang.code}): ${successCount}/${files.length} thành công`);
    return { success: successCount, total: files.length };
}

// Hàm chính
async function translateWithRotation() {
    if (!GEMINI_API_KEYS.length) {
        console.error('❌ Vui lòng thêm API keys vào script');
        return;
    }

    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`❌ Thư mục nguồn không tồn tại: ${SOURCE_DIR}`);
        return;
    }

    console.log(`🚀 Bắt đầu dịch ${LANGUAGES.length} ngôn ngữ phổ biến cho mục image`);
    console.log(`📊 Tổng cộng: ${LANGUAGES.length} ngôn ngữ`);
    console.log(`🔑 Sử dụng ${GEMINI_API_KEYS.length} API keys luân phiên`);
    console.log(`⏱️  Delay: 3 giây giữa các request, 10 giây giữa các ngôn ngữ\n`);

    const results = [];

    for (let i = 0; i < LANGUAGES.length; i++) {
        const lang = LANGUAGES[i];
        
        console.log(`\n${'='.repeat(60)}`);
        console.log(`🌍 NGÔN NGỮ ${i + 1}/${LANGUAGES.length}: ${lang.name} (${lang.code})`);
        console.log(`${'='.repeat(60)}`);

        try {
            const result = await translateLanguage(lang);
            results.push({ lang: lang.code, ...result });
        } catch (error) {
            console.error(`❌ Lỗi khi dịch ${lang.name}: ${error.message}`);
            results.push({ lang: lang.code, success: 0, total: 0 });
        }

        // Delay giữa các ngôn ngữ (trừ ngôn ngữ cuối)
        if (i < LANGUAGES.length - 1) {
            console.log('\n⏳ Waiting 10 seconds before next language...');
            await delay(10000);
        }
    }

    // Thống kê tổng kết
    console.log('\n' + '='.repeat(80));
    console.log('📊 THỐNG KÊ TỔNG KẾT:');
    console.log('='.repeat(80));
    
    let totalSuccess = 0;
    let totalFiles = 0;
    
    results.forEach(result => {
        console.log(`${result.lang}: ${result.success}/${result.total} file`);
        totalSuccess += result.success;
        totalFiles += result.total;
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`🎯 TỔNG CỘNG: ${totalSuccess}/${totalFiles} file thành công`);
    console.log(`🌍 SỐ NGÔN NGỮ: ${LANGUAGES.length}`);
    console.log(`📈 TỶ LỆ THÀNH CÔNG: ${((totalSuccess/totalFiles)*100).toFixed(1)}%`);
    console.log('='.repeat(80));
}

// Chạy script
translateWithRotation().catch(console.error);
