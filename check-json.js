const fs = require('fs');
const path = require('path');

const ROOT = 'locales';
const SOURCE_DIR = path.join(ROOT, 'en', 'image');

function isJsonValid(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        return true;
    } catch (e) {
        return false;
    }
}

function main() {
    console.log('🔍 Kiểm tra tất cả file JSON trong tất cả ngôn ngữ...\n');
    
    // Lấy danh sách file nguồn
    const sourceFiles = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.json'));
    console.log(`📁 File nguồn (en): ${sourceFiles.length} file`);
    console.log('📋 Danh sách:', sourceFiles.join(', '));
    console.log('');
    
    // Lấy danh sách ngôn ngữ
    const langs = fs.readdirSync(ROOT).filter(d => {
        const langPath = path.join(ROOT, d);
        return fs.statSync(langPath).isDirectory() && d !== 'en';
    }).sort();
    
    console.log(`🌍 Tổng số ngôn ngữ: ${langs.length}`);
    console.log('📋 Danh sách:', langs.join(', '));
    console.log('');
    
    let totalFiles = 0;
    let validFiles = 0;
    let invalidFiles = 0;
    let missingFiles = 0;
    
    const report = {
        valid: [],
        invalid: [],
        missing: []
    };
    
    // Kiểm tra từng ngôn ngữ
    for (const lang of langs) {
        const langDir = path.join(ROOT, lang, 'image');
        if (!fs.existsSync(langDir)) {
            console.log(`❌ ${lang}: thư mục image không tồn tại`);
            continue;
        }
        
        console.log(`\n🌍 ${lang}:`);
        let langValid = 0;
        let langInvalid = 0;
        let langMissing = 0;
        
        for (const filename of sourceFiles) {
            const targetPath = path.join(langDir, filename);
            totalFiles++;
            
            if (!fs.existsSync(targetPath)) {
                langMissing++;
                missingFiles++;
                report.missing.push(`${lang}/${filename}`);
                console.log(`  ❌ ${filename}: thiếu`);
            } else if (!isJsonValid(targetPath)) {
                langInvalid++;
                invalidFiles++;
                report.invalid.push(`${lang}/${filename}`);
                console.log(`  ⚠️  ${filename}: JSON lỗi`);
            } else {
                langValid++;
                validFiles++;
                report.valid.push(`${lang}/${filename}`);
                console.log(`  ✅ ${filename}: OK`);
            }
        }
        
        console.log(`  📊 ${lang}: ${langValid}/${sourceFiles.length} OK, ${langInvalid} lỗi, ${langMissing} thiếu`);
    }
    
    // Báo cáo tổng kết
    console.log('\n' + '='.repeat(80));
    console.log('🎯 BÁO CÁO TỔNG KẾT');
    console.log('='.repeat(80));
    console.log(`📊 Tổng số file cần có: ${totalFiles}`);
    console.log(`✅ File hợp lệ: ${validFiles}`);
    console.log(`⚠️  File JSON lỗi: ${invalidFiles}`);
    console.log(`❌ File thiếu: ${missingFiles}`);
    console.log(`📈 Tỷ lệ thành công: ${((validFiles / totalFiles) * 100).toFixed(1)}%`);
    
    if (report.invalid.length > 0) {
        console.log('\n⚠️  DANH SÁCH FILE JSON LỖI:');
        report.invalid.forEach(file => console.log(`  - ${file}`));
    }
    
    if (report.missing.length > 0) {
        console.log('\n❌ DANH SÁCH FILE THIẾU:');
        report.missing.forEach(file => console.log(`  - ${file}`));
    }
    
    // Lưu báo cáo
    const reportData = {
        timestamp: new Date().toISOString(),
        summary: {
            totalFiles,
            validFiles,
            invalidFiles,
            missingFiles,
            successRate: ((validFiles / totalFiles) * 100).toFixed(1)
        },
        details: {
            valid: report.valid,
            invalid: report.invalid,
            missing: report.missing
        }
    };
    
    fs.writeFileSync('json-validation-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Báo cáo chi tiết đã lưu vào: json-validation-report.json');
}

main().catch(console.error);
