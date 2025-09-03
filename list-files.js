const fs = require('fs');
const path = require('path');

function findJsonFiles(dir) {
    const files = [];
    
    function scanDirectory(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scanDirectory(fullPath);
            } else if (item.endsWith('.json')) {
                files.push(fullPath);
            }
        }
    }
    
    scanDirectory(dir);
    return files;
}

function main() {
    console.log('📁 JSON Files in locales/en/image:\n');
    
    const sourceDir = path.join(__dirname, 'locales', 'en', 'image');
    
    if (!fs.existsSync(sourceDir)) {
        console.error('❌ Directory not found:', sourceDir);
        return;
    }
    
    const jsonFiles = findJsonFiles(sourceDir);
    
    if (jsonFiles.length === 0) {
        console.log('❌ No JSON files found');
        return;
    }
    
    console.log(`Found ${jsonFiles.length} JSON files:\n`);
    
    jsonFiles.forEach((file, index) => {
        const relativePath = path.relative(__dirname, file);
        const fileName = path.basename(file);
        const fileSize = fs.statSync(file).size;
        
        console.log(`${index + 1}. ${fileName}`);
        console.log(`   📍 ${relativePath}`);
        console.log(`   📏 ${fileSize} bytes`);
        console.log('');
    });
    
    console.log('💡 To translate all files:');
    console.log('   node translate-json.js');
    console.log('');
    console.log('💡 To translate a specific file:');
    console.log('   node translate-single.js <filename>');
    console.log('   Example: node translate-single.js convert-jpg-to-png.json');
}

main();



