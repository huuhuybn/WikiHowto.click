const fs = require('fs');

// API keys
const GEMINI_API_KEYS = [
    'AIzaSyCjyLve07XNJTPVmvGYch62EflzMuUReLo',
    'AIzaSyB-vqzjj-4lejpeoF5zFTLc23o-8Jf_Qhs',
    'AIzaSyBomJwcxWIlFmck556XBppbvbNbEic6d0Y',
    'AIzaSyD3NQSTBvMLw9FHXU0LdiZYsVk2IZNn8XU'
];
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testApiKey(apiKey, keyIndex) {
    console.log(`\n🔑 Testing API Key #${keyIndex + 1}...`);
    
    const requestBody = {
        contents: [{ parts: [{ text: "Translate 'Hello' to French. Return only the translation." }] }]
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Key #${keyIndex + 1}: OK - Response received`);
            return true;
        } else if (response.status === 429) {
            console.log(`⚠️ Key #${keyIndex + 1}: RATE LIMITED (429)`);
            return false;
        } else {
            console.log(`❌ Key #${keyIndex + 1}: HTTP ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Key #${keyIndex + 1}: Error - ${error.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 Testing all API keys...');
    
    const results = [];
    
    for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
        const isWorking = await testApiKey(GEMINI_API_KEYS[i], i);
        results.push({ keyIndex: i, working: isWorking });
        
        // Delay between tests
        if (i < GEMINI_API_KEYS.length - 1) {
            console.log('⏳ Waiting 10 seconds before next test...');
            await delay(10000);
        }
    }
    
    console.log('\n📊 RESULTS:');
    const workingKeys = results.filter(r => r.working);
    const rateLimitedKeys = results.filter(r => !r.working);
    
    console.log(`✅ Working keys: ${workingKeys.length}/${GEMINI_API_KEYS.length}`);
    console.log(`⚠️ Rate limited keys: ${rateLimitedKeys.length}/${GEMINI_API_KEYS.length}`);
    
    if (workingKeys.length === 0) {
        console.log('\n❌ All keys are rate limited. Need to wait or get new keys.');
    } else {
        console.log('\n✅ Some keys are still working. Can continue with translation.');
    }
}

main().catch(console.error);
