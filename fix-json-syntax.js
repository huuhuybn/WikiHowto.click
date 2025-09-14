const fs = require('fs');
const path = require('path');

// Hàm fix JSON syntax - thêm dấu phẩy thiếu
function fixJsonSyntax(jsonString) {
    // Thay thế các pattern thiếu dấu phẩy
    let fixed = jsonString
        // Fix: "key": "value"\n\n  "key2" -> "key": "value",\n  "key2"
        .replace(/"\s*\n\s*"/g, '",\n  "')
        // Fix: "key": "value"\n  "key2" -> "key": "value",\n  "key2"  
        .replace(/"\s*\n\s+"/g, '",\n  "')
        // Fix: }\n  "key" -> },\n  "key"
        .replace(/}\s*\n\s*"/g, '},\n  "')
        // Fix: ]\n  "key" -> ],\n  "key"
        .replace(/]\s*\n\s*"/g, '],\n  "')
        // Fix: }\n  { -> },\n  {
        .replace(/}\s*\n\s*{/g, '},\n  {')
        // Fix: ]\n  { -> ],\n  {
        .replace(/]\s*\n\s*{/g, '],\n  {')
        // Fix: }\n  [ -> },\n  [
        .replace(/}\s*\n\s*\[/g, '},\n  [')
        // Fix: ]\n  [ -> ],\n  [
        .replace(/]\s*\n\s*\[/g, '],\n  [')
        // Fix: number\n  "key" -> number,\n  "key"
        .replace(/(\d+)\s*\n\s*"/g, '$1,\n  "')
        // Fix: true\n  "key" -> true,\n  "key"
        .replace(/true\s*\n\s*"/g, 'true,\n  "')
        // Fix: false\n  "key" -> false,\n  "key"
        .replace(/false\s*\n\s*"/g, 'false,\n  "')
        // Fix: null\n  "key" -> null,\n  "key"
        .replace(/null\s*\n\s*"/g, 'null,\n  "');
    
    return fixed;
}

// Hàm kiểm tra và fix file JSON
function fixJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Thử parse JSON
        try {
            JSON.parse(content);
            console.log(`✅ ${filePath} - Already valid`);
            return true;
        } catch (parseError) {
            console.log(`❌ ${filePath} - Invalid JSON, fixing...`);
            
            // Fix JSON syntax
            const fixedContent = fixJsonSyntax(content);
            
            // Thử parse lại
            try {
                JSON.parse(fixedContent);
                fs.writeFileSync(filePath, fixedContent, 'utf8');
                console.log(`✅ ${filePath} - Fixed successfully`);
                return true;
            } catch (secondParseError) {
                console.log(`❌ ${filePath} - Still invalid after fix:`, secondParseError.message);
                return false;
            }
        }
    } catch (error) {
        console.log(`❌ ${filePath} - Error reading file:`, error.message);
        return false;
    }
}

// Hàm tìm tất cả file JSON trong thư mục
function findJsonFiles(dir) {
    const jsonFiles = [];
    
    function scanDirectory(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                scanDirectory(fullPath);
            } else if (item.endsWith('.json')) {
                jsonFiles.push(fullPath);
            }
        }
    }
    
    scanDirectory(dir);
    return jsonFiles;
}

// Main execution
console.log('🔧 Fixing JSON syntax errors...\n');

const localesDir = 'locales';
const jsonFiles = findJsonFiles(localesDir);

let fixedCount = 0;
let totalCount = jsonFiles.length;

console.log(`Found ${totalCount} JSON files to check\n`);

for (const filePath of jsonFiles) {
    if (fixJsonFile(filePath)) {
        fixedCount++;
    }
}

console.log(`\n📊 Summary:`);
console.log(`Total files: ${totalCount}`);
console.log(`Fixed files: ${fixedCount}`);
console.log(`Already valid: ${totalCount - fixedCount}`);

// Tạo report
const report = `JSON Syntax Fix Report
Generated: ${new Date().toISOString()}

Total files checked: ${totalCount}
Files fixed: ${fixedCount}
Already valid: ${totalCount - fixedCount}

Fixed files:
${jsonFiles.filter(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        JSON.parse(content);
        return false;
    } catch {
        return true;
    }
}).map(file => `- ${file}`).join('\n')}
`;

fs.writeFileSync('json-syntax-fix-report.txt', report);
console.log('\n✅ Report saved to: json-syntax-fix-report.txt');
