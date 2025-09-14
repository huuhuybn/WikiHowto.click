const fs = require('fs');
const path = require('path');

// Hàm fix JSON bằng cách parse và rebuild
function fixJsonByRebuild(jsonString) {
    try {
        // Thử parse trực tiếp
        return JSON.parse(jsonString);
    } catch (error) {
        // Nếu parse lỗi, thử fix bằng regex trước
        let fixed = jsonString;
        
        // Fix 1: Thêm dấu phẩy sau string values
        fixed = fixed.replace(/"\s*\n\s*"/g, '",\n  "');
        
        // Fix 2: Thêm dấu phẩy sau object closing brace
        fixed = fixed.replace(/}\s*\n\s*"/g, '},\n  "');
        fixed = fixed.replace(/}\s*\n\s*{/g, '},\n  {');
        fixed = fixed.replace(/}\s*\n\s*\[/g, '},\n  [');
        
        // Fix 3: Thêm dấu phẩy sau array closing bracket
        fixed = fixed.replace(/]\s*\n\s*"/g, '],\n  "');
        fixed = fixed.replace(/]\s*\n\s*{/g, '],\n  {');
        fixed = fixed.replace(/]\s*\n\s*\[/g, '],\n  [');
        
        // Fix 4: Thêm dấu phẩy sau primitive values
        fixed = fixed.replace(/(\d+)\s*\n\s*"/g, '$1,\n  "');
        fixed = fixed.replace(/true\s*\n\s*"/g, 'true,\n  "');
        fixed = fixed.replace(/false\s*\n\s*"/g, 'false,\n  "');
        fixed = fixed.replace(/null\s*\n\s*"/g, 'null,\n  "');
        
        // Fix 5: Thêm dấu phẩy sau primitive values với object/array
        fixed = fixed.replace(/(\d+)\s*\n\s*{/g, '$1,\n  {');
        fixed = fixed.replace(/(\d+)\s*\n\s*\[/g, '$1,\n  [');
        fixed = fixed.replace(/true\s*\n\s*{/g, 'true,\n  {');
        fixed = fixed.replace(/true\s*\n\s*\[/g, 'true,\n  [');
        fixed = fixed.replace(/false\s*\n\s*{/g, 'false,\n  {');
        fixed = fixed.replace(/false\s*\n\s*\[/g, 'false,\n  [');
        fixed = fixed.replace(/null\s*\n\s*{/g, 'null,\n  {');
        fixed = fixed.replace(/null\s*\n\s*\[/g, 'null,\n  [');
        
        // Fix 6: Xử lý các trường hợp đặc biệt với nhiều dòng trống
        fixed = fixed.replace(/"\s*\n\s*\n\s*"/g, '",\n  "');
        fixed = fixed.replace(/}\s*\n\s*\n\s*"/g, '},\n  "');
        fixed = fixed.replace(/]\s*\n\s*\n\s*"/g, '],\n  "');
        
        // Fix 7: Xử lý array elements thiếu dấu phẩy
        fixed = fixed.replace(/"\s*\n\s*\]/g, '"\n  ]');
        fixed = fixed.replace(/(\d+)\s*\n\s*\]/g, '$1\n  ]');
        fixed = fixed.replace(/true\s*\n\s*\]/g, 'true\n  ]');
        fixed = fixed.replace(/false\s*\n\s*\]/g, 'false\n  ]');
        fixed = fixed.replace(/null\s*\n\s*\]/g, 'null\n  ]');
        fixed = fixed.replace(/}\s*\n\s*\]/g, '}\n  ]');
        
        // Fix 8: Xử lý object properties thiếu dấu phẩy
        fixed = fixed.replace(/"\s*\n\s*}/g, '"\n  }');
        fixed = fixed.replace(/(\d+)\s*\n\s*}/g, '$1\n  }');
        fixed = fixed.replace(/true\s*\n\s*}/g, 'true\n  }');
        fixed = fixed.replace(/false\s*\n\s*}/g, 'false\n  }');
        fixed = fixed.replace(/null\s*\n\s*}/g, 'null\n  }');
        fixed = fixed.replace(/]\s*\n\s*}/g, ']\n  }');
        
        // Thử parse lại
        try {
            return JSON.parse(fixed);
        } catch (secondError) {
            // Nếu vẫn lỗi, thử fix thêm lần nữa
            fixed = fixed.replace(/"\s*\n\s*"/g, '",\n  "');
            fixed = fixed.replace(/}\s*\n\s*"/g, '},\n  "');
            fixed = fixed.replace(/]\s*\n\s*"/g, '],\n  "');
            
            try {
                return JSON.parse(fixed);
            } catch (thirdError) {
                throw new Error(`Cannot fix JSON: ${thirdError.message}`);
            }
        }
    }
}

// Hàm kiểm tra và fix file JSON
function fixJsonFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Thử parse JSON
        try {
            JSON.parse(content);
            return { success: true, message: 'Already valid' };
        } catch (parseError) {
            console.log(`❌ ${filePath} - Invalid JSON, fixing...`);
            
            try {
                // Fix JSON bằng cách rebuild
                const parsedData = fixJsonByRebuild(content);
                
                // Ghi lại file với format đẹp
                const fixedContent = JSON.stringify(parsedData, null, 2);
                fs.writeFileSync(filePath, fixedContent, 'utf8');
                
                return { success: true, message: 'Fixed successfully' };
            } catch (fixError) {
                return { success: false, message: `Cannot fix: ${fixError.message}` };
            }
        }
    } catch (error) {
        return { success: false, message: `Error reading file: ${error.message}` };
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
console.log('🔧 Fixing JSON syntax errors (Final Version)...\n');

const localesDir = 'locales';
const jsonFiles = findJsonFiles(localesDir);

let fixedCount = 0;
let alreadyValidCount = 0;
let failedCount = 0;
let totalCount = jsonFiles.length;

console.log(`Found ${totalCount} JSON files to check\n`);

const failedFiles = [];

for (const filePath of jsonFiles) {
    const result = fixJsonFile(filePath);
    
    if (result.success) {
        if (result.message === 'Already valid') {
            alreadyValidCount++;
        } else {
            fixedCount++;
            console.log(`✅ ${filePath} - ${result.message}`);
        }
    } else {
        failedCount++;
        failedFiles.push({ file: filePath, error: result.message });
        console.log(`❌ ${filePath} - ${result.message}`);
    }
}

console.log(`\n📊 Summary:`);
console.log(`Total files: ${totalCount}`);
console.log(`Fixed files: ${fixedCount}`);
console.log(`Already valid: ${alreadyValidCount}`);
console.log(`Failed files: ${failedCount}`);

// Tạo report
const report = `JSON Syntax Fix Report Final
Generated: ${new Date().toISOString()}

Total files checked: ${totalCount}
Files fixed: ${fixedCount}
Already valid: ${alreadyValidCount}
Failed files: ${failedCount}

Failed files:
${failedFiles.map(f => `- ${f.file}: ${f.error}`).join('\n')}
`;

fs.writeFileSync('json-syntax-fix-report-final.txt', report);
console.log('\n✅ Report saved to: json-syntax-fix-report-final.txt');

if (failedCount > 0) {
    console.log('\n❌ Some files still have issues. Manual review needed.');
    process.exit(1);
} else {
    console.log('\n🎉 All JSON files are now valid!');
}
