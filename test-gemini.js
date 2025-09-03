const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
    console.log('🧪 Testing Gemini AI API...\n');
    
    // Kiểm tra API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in environment variables');
        console.log('Please set: export GEMINI_API_KEY="your-api-key-here"');
        return;
    }
    
    try {
        // Khởi tạo Gemini AI
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        // Test với prompt đơn giản
        const prompt = "Translate 'Hello World' to Vietnamese";
        console.log(`📝 Testing with prompt: "${prompt}"`);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ API Test Successful!`);
        console.log(`📤 Response: ${text}`);
        console.log('\n🎉 Gemini AI API is working correctly!');
        
    } catch (error) {
        console.error('❌ API Test Failed:', error.message);
        
        if (error.message.includes('API_KEY')) {
            console.log('\n💡 Possible solutions:');
            console.log('1. Check if your API key is correct');
            console.log('2. Make sure you have enabled Gemini API in Google Cloud Console');
            console.log('3. Verify your API key has the necessary permissions');
        }
    }
}

// Chạy test
testGeminiAPI().catch(console.error);



