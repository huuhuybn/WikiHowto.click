const { translateFile } = require('./translate-image-files.js');

async function testSingleLanguage() {
    console.log('🧪 Testing translation with single file and language...');
    
    const sourceFilePath = './locales/en/image/convert-webp-to-jpg.json';
    const targetLanguage = 'zh-CN'; // Chinese Simplified
    
    try {
        const success = await translateFile(sourceFilePath, targetLanguage);
        
        if (success) {
            console.log('✅ Test successful!');
        } else {
            console.log('❌ Test failed!');
        }
    } catch (error) {
        console.error('❌ Test error:', error.message);
    }
}

testSingleLanguage();
