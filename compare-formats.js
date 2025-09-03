const fs = require('fs');

// Danh sách hiện tại của bạn
const currentFormats = {
  "PDF ↔ Image": [
    "pdf-to-jpg", "pdf-to-png", "pdf-to-webp", "pdf-to-tiff",
    "jpg-to-pdf", "png-to-pdf", "webp-to-pdf", "tiff-to-pdf"
  ],
  "Image ↔ Image": [
    "jpg-to-png", "png-to-jpg", "jpg-to-webp", "webp-to-jpg",
    "png-to-webp", "webp-to-png", "gif-to-png", "heic-to-jpg",
    "avif-to-png", "bmp-to-png", "tiff-to-jpg", "svg-to-png",
    "png-to-ico", "jpg-to-ico", "svg-to-ico"
  ],
  "Office ↔ PDF": [
    "docx-to-pdf", "xlsx-to-pdf", "pptx-to-pdf",
    "pdf-to-docx", "pdf-to-xlsx", "pdf-to-pptx"
  ],
  "Archive": [
    "zip-to-rar", "rar-to-zip", "7z-to-zip", "tar-to-zip"
  ],
  "Audio": [
    "mp3-to-wav", "wav-to-mp3", "mp3-to-aac", "m4a-to-mp3",
    "ogg-to-mp3", "wav-to-flac"
  ],
  "Video": [
    "mp4-to-webm", "webm-to-mp4", "mov-to-mp4", "mkv-to-mp4",
    "avi-to-mp4", "mp4-to-gif"
  ],
  "Font/Webfont": [
    "ttf-to-woff", "woff-to-ttf", "ttf-to-woff2", "woff2-to-ttf",
    "otf-to-ttf", "eot-to-woff"
  ]
};

// Đọc dữ liệu CloudConvert
const cloudConvertData = JSON.parse(fs.readFileSync('cloudconvert-conversion-types.json', 'utf8'));

// Tạo danh sách CloudConvert theo nhóm
const cloudConvertFormats = {};
cloudConvertData.forEach(item => {
  if (!cloudConvertFormats[item.group]) {
    cloudConvertFormats[item.group] = [];
  }
  cloudConvertFormats[item.group].push(item.type);
});

// Hàm so sánh và tạo báo cáo
function compareFormats() {
  let report = '=== SO SÁNH FORMATS ===\n\n';
  
  // Mapping tên nhóm
  const groupMapping = {
    'pdf': 'PDF ↔ Image',
    'image': 'Image ↔ Image', 
    'office': 'Office ↔ PDF',
    'archive': 'Archive',
    'audio': 'Audio',
    'video': 'Video',
    'font': 'Font/Webfont'
  };
  
  Object.keys(groupMapping).forEach(cloudGroup => {
    const yourGroup = groupMapping[cloudGroup];
    const cloudFormats = cloudConvertFormats[cloudGroup] || [];
    const yourFormats = currentFormats[yourGroup] || [];
    
    report += `=== ${yourGroup.toUpperCase()} ===\n`;
    report += `CloudConvert: ${cloudFormats.length} formats\n`;
    report += `Your list: ${yourFormats.length} formats\n\n`;
    
    // Tìm các format có trong CloudConvert nhưng không có trong danh sách của bạn
    const missingInYours = cloudFormats.filter(f => !yourFormats.includes(f));
    if (missingInYours.length > 0) {
      report += `❌ Missing in your list (${missingInYours.length}):\n`;
      missingInYours.forEach(f => report += `  - ${f}\n`);
      report += '\n';
    }
    
    // Tìm các format có trong danh sách của bạn nhưng không có trong CloudConvert
    const missingInCloud = yourFormats.filter(f => !cloudFormats.includes(f));
    if (missingInCloud.length > 0) {
      report += `⚠️ Not in CloudConvert (${missingInCloud.length}):\n`;
      missingInCloud.forEach(f => report += `  - ${f}\n`);
      report += '\n';
    }
    
    // Tìm các format có trong cả hai
    const common = cloudFormats.filter(f => yourFormats.includes(f));
    if (common.length > 0) {
      report += `✅ Common formats (${common.length}):\n`;
      common.forEach(f => report += `  - ${f}\n`);
      report += '\n';
    }
    
    report += '\n';
  });
  
  return report;
}

// Hàm tạo danh sách đề xuất bổ sung
function generateSuggestions() {
  let suggestions = '=== ĐỀ XUẤT BỔ SUNG ===\n\n';
  
  const groupMapping = {
    'pdf': 'PDF ↔ Image',
    'image': 'Image ↔ Image', 
    'office': 'Office ↔ PDF',
    'archive': 'Archive',
    'audio': 'Audio',
    'video': 'Video',
    'font': 'Font/Webfont'
  };
  
  Object.keys(groupMapping).forEach(cloudGroup => {
    const yourGroup = groupMapping[cloudGroup];
    const cloudFormats = cloudConvertFormats[cloudGroup] || [];
    const yourFormats = currentFormats[yourGroup] || [];
    
    const missingInYours = cloudFormats.filter(f => !yourFormats.includes(f));
    if (missingInYours.length > 0) {
      suggestions += `${yourGroup}:\n`;
      missingInYours.forEach(f => suggestions += `  - ${f}\n`);
      suggestions += '\n';
    }
  });
  
  return suggestions;
}

// Hàm tạo thống kê tổng hợp
function generateStats() {
  let stats = '=== THỐNG KÊ TỔNG HỢP ===\n\n';
  
  let totalCloudConvert = 0;
  let totalYours = 0;
  let totalCommon = 0;
  let totalMissing = 0;
  
  const groupMapping = {
    'pdf': 'PDF ↔ Image',
    'image': 'Image ↔ Image', 
    'office': 'Office ↔ PDF',
    'archive': 'Archive',
    'audio': 'Audio',
    'video': 'Video',
    'font': 'Font/Webfont'
  };
  
  Object.keys(groupMapping).forEach(cloudGroup => {
    const yourGroup = groupMapping[cloudGroup];
    const cloudFormats = cloudConvertFormats[cloudGroup] || [];
    const yourFormats = currentFormats[yourGroup] || [];
    
    const common = cloudFormats.filter(f => yourFormats.includes(f));
    const missingInYours = cloudFormats.filter(f => !yourFormats.includes(f));
    
    totalCloudConvert += cloudFormats.length;
    totalYours += yourFormats.length;
    totalCommon += common.length;
    totalMissing += missingInYours.length;
    
    stats += `${yourGroup}:\n`;
    stats += `  CloudConvert: ${cloudFormats.length}\n`;
    stats += `  Your list: ${yourFormats.length}\n`;
    stats += `  Common: ${common.length}\n`;
    stats += `  Missing: ${missingInYours.length}\n\n`;
  });
  
  stats += `TỔNG CỘNG:\n`;
  stats += `  CloudConvert formats: ${totalCloudConvert}\n`;
  stats += `  Your formats: ${totalYours}\n`;
  stats += `  Common formats: ${totalCommon}\n`;
  stats += `  Missing formats: ${totalMissing}\n`;
  stats += `  Coverage: ${((totalCommon / totalCloudConvert) * 100).toFixed(1)}%\n`;
  
  return stats;
}

// Main execution
console.log('Comparing formats...\n');

// Tạo báo cáo so sánh
const comparisonReport = compareFormats();
fs.writeFileSync('format-comparison.txt', comparisonReport);
console.log('✅ Created: format-comparison.txt');

// Tạo đề xuất bổ sung
const suggestions = generateSuggestions();
fs.writeFileSync('format-suggestions.txt', suggestions);
console.log('✅ Created: format-suggestions.txt');

// Tạo thống kê
const stats = generateStats();
fs.writeFileSync('format-stats.txt', stats);
console.log('✅ Created: format-stats.txt');

console.log('\n🎉 Comparison completed! Check the generated files:');
console.log('- format-comparison.txt (Detailed comparison)');
console.log('- format-suggestions.txt (Suggested additions)');
console.log('- format-stats.txt (Statistics)');


