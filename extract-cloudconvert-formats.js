const fs = require('fs');

// Dữ liệu từ CloudConvert API (đã được cung cấp)
const cloudConvertData = {
  "data": [
    {"operation":"convert","input_format":"7z","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"7z","output_format":"tar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"7z","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"zip","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"zip","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"rar","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"rar","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"mp3","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wav","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"mp3","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4a","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ogg","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wav","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ttf","output_format":"woff","engine":"fonttool","credits":1,"meta":{"group":"font"}},
    {"operation":"convert","input_format":"woff","output_format":"ttf","engine":"fonttool","credits":1,"meta":{"group":"font"}},
    {"operation":"convert","input_format":"ttf","output_format":"woff2","engine":"fonttool","credits":1,"meta":{"group":"font"}},
    {"operation":"convert","input_format":"woff2","output_format":"ttf","engine":"fonttool","credits":1,"meta":{"group":"font"}},
    {"operation":"convert","input_format":"otf","output_format":"ttf","engine":"fonttool","credits":1,"meta":{"group":"font"}},
    {"operation":"convert","input_format":"eot","output_format":"woff","engine":"fonttool","credits":1,"meta":{"group":"font"}},
    {"operation":"convert","input_format":"jpg","output_format":"png","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"png","output_format":"jpg","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"jpg","output_format":"webp","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"webp","output_format":"jpg","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"png","output_format":"webp","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"webp","output_format":"png","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"gif","output_format":"png","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"heic","output_format":"jpg","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"avif","output_format":"png","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"bmp","output_format":"png","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"tiff","output_format":"jpg","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"svg","output_format":"png","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"png","output_format":"ico","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"jpg","output_format":"ico","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"svg","output_format":"ico","engine":"imagemagick","credits":1,"meta":{"group":"image"}},
    {"operation":"convert","input_format":"pdf","output_format":"jpg","engine":"imagemagick","credits":1,"meta":{"group":"pdf"}},
    {"operation":"convert","input_format":"pdf","output_format":"png","engine":"imagemagick","credits":1,"meta":{"group":"pdf"}},
    {"operation":"convert","input_format":"pdf","output_format":"webp","engine":"imagemagick","credits":1,"meta":{"group":"pdf"}},
    {"operation":"convert","input_format":"pdf","output_format":"tiff","engine":"imagemagick","credits":1,"meta":{"group":"pdf"}},
    {"operation":"convert","input_format":"jpg","output_format":"pdf","engine":"libreoffice","credits":1,"meta":{"group":"pdf"}},
    {"operation":"convert","input_format":"png","output_format":"pdf","engine":"libreoffice","credits":1,"meta":{"group":"pdf"}},
    {"operation":"convert","input_format":"webp","output_format":"pdf","engine":"libreoffice","credits":1,"meta":{"group":"pdf"}},
    {"operation":"convert","input_format":"tiff","output_format":"pdf","engine":"libreoffice","credits":1,"meta":{"group":"pdf"}},
    {"operation":"convert","input_format":"docx","output_format":"pdf","engine":"libreoffice","credits":1,"meta":{"group":"office"}},
    {"operation":"convert","input_format":"xlsx","output_format":"pdf","engine":"libreoffice","credits":1,"meta":{"group":"office"}},
    {"operation":"convert","input_format":"pptx","output_format":"pdf","engine":"libreoffice","credits":1,"meta":{"group":"office"}},
    {"operation":"convert","input_format":"pdf","output_format":"docx","engine":"libreoffice","credits":1,"meta":{"group":"office"}},
    {"operation":"convert","input_format":"pdf","output_format":"xlsx","engine":"libreoffice","credits":1,"meta":{"group":"office"}},
    {"operation":"convert","input_format":"pdf","output_format":"pptx","engine":"libreoffice","credits":1,"meta":{"group":"office"}},
    {"operation":"convert","input_format":"mp4","output_format":"webm","engine":"ffmpeg","credits":1,"meta":{"group":"video"}},
    {"operation":"convert","input_format":"webm","output_format":"mp4","engine":"ffmpeg","credits":1,"meta":{"group":"video"}},
    {"operation":"convert","input_format":"mov","output_format":"mp4","engine":"ffmpeg","credits":1,"meta":{"group":"video"}},
    {"operation":"convert","input_format":"mkv","output_format":"mp4","engine":"ffmpeg","credits":1,"meta":{"group":"video"}},
    {"operation":"convert","input_format":"avi","output_format":"mp4","engine":"ffmpeg","credits":1,"meta":{"group":"video"}},
    {"operation":"convert","input_format":"mp4","output_format":"gif","engine":"ffmpeg","credits":1,"meta":{"group":"video"}},
    {"operation":"convert","input_format":"gif","output_format":"mp4","engine":"ffmpeg","credits":1,"meta":{"group":"video"}},
    {"operation":"convert","input_format":"png","output_format":"gif","engine":"ffmpeg","credits":1,"meta":{"group":"video"}},
    {"operation":"convert","input_format":"jpg","output_format":"gif","engine":"ffmpeg","credits":1,"meta":{"group":"video"}}
  ]
};

// Hàm tạo CSV header
function createCSVHeader() {
  return 'Group,Input Format,Output Format,Conversion Type,Engine,Credits,Status\n';
}

// Hàm tạo CSV row
function createCSVRow(item, status = 'Available') {
  const conversionType = `${item.input_format}-to-${item.output_format}`;
  return `${item.meta.group},${item.input_format},${item.output_format},${conversionType},${item.engine},${item.credits},${status}\n`;
}

// Hàm phân loại và tạo CSV
function generateCSV() {
  let csvContent = createCSVHeader();
  
  // Nhóm theo category
  const groupedData = {};
  
  cloudConvertData.data.forEach(item => {
    const group = item.meta.group;
    if (!groupedData[group]) {
      groupedData[group] = [];
    }
    groupedData[group].push(item);
  });
  
  // Tạo CSV cho từng nhóm
  Object.keys(groupedData).sort().forEach(group => {
    console.log(`Processing group: ${group} (${groupedData[group].length} conversions)`);
    
    groupedData[group].forEach(item => {
      csvContent += createCSVRow(item);
    });
  });
  
  return csvContent;
}

// Hàm tạo báo cáo thống kê
function generateReport() {
  const stats = {};
  
  cloudConvertData.data.forEach(item => {
    const group = item.meta.group;
    if (!stats[group]) {
      stats[group] = {
        count: 0,
        engines: new Set(),
        formats: new Set()
      };
    }
    stats[group].count++;
    stats[group].engines.add(item.engine);
    stats[group].formats.add(item.input_format);
    stats[group].formats.add(item.output_format);
  });
  
  let report = '=== CLOUDCONVERT FORMATS REPORT ===\n\n';
  
  Object.keys(stats).sort().forEach(group => {
    report += `${group.toUpperCase()}:\n`;
    report += `  Total conversions: ${stats[group].count}\n`;
    report += `  Engines: ${Array.from(stats[group].engines).join(', ')}\n`;
    report += `  Unique formats: ${Array.from(stats[group].formats).length}\n`;
    report += `  Formats: ${Array.from(stats[group].formats).sort().join(', ')}\n\n`;
  });
  
  return report;
}

// Hàm tạo danh sách conversion types
function generateConversionTypes() {
  const conversions = cloudConvertData.data.map(item => ({
    type: `${item.input_format}-to-${item.output_format}`,
    group: item.meta.group,
    input: item.input_format,
    output: item.output_format,
    engine: item.engine
  }));
  
  return conversions.sort((a, b) => {
    if (a.group !== b.group) return a.group.localeCompare(b.group);
    return a.type.localeCompare(b.type);
  });
}

// Main execution
console.log('Extracting CloudConvert formats...\n');

// Tạo CSV
const csvContent = generateCSV();
fs.writeFileSync('cloudconvert-formats.csv', csvContent);
console.log('✅ Created: cloudconvert-formats.csv');

// Tạo báo cáo
const report = generateReport();
fs.writeFileSync('cloudconvert-report.txt', report);
console.log('✅ Created: cloudconvert-report.txt');

// Tạo danh sách conversion types
const conversionTypes = generateConversionTypes();
const conversionTypesJson = JSON.stringify(conversionTypes, null, 2);
fs.writeFileSync('cloudconvert-conversion-types.json', conversionTypesJson);
console.log('✅ Created: cloudconvert-conversion-types.json');

// Tạo danh sách theo nhóm
const groupedConversions = {};
conversionTypes.forEach(conv => {
  if (!groupedConversions[conv.group]) {
    groupedConversions[conv.group] = [];
  }
  groupedConversions[conv.group].push(conv.type);
});

let groupedList = '=== CONVERSION TYPES BY GROUP ===\n\n';
Object.keys(groupedConversions).sort().forEach(group => {
  groupedList += `${group.toUpperCase()}:\n`;
  groupedConversions[group].forEach(type => {
    groupedList += `  - ${type}\n`;
  });
  groupedList += '\n';
});

fs.writeFileSync('cloudconvert-grouped-list.txt', groupedList);
console.log('✅ Created: cloudconvert-grouped-list.txt');

console.log('\n🎉 Extraction completed! Check the generated files:');
console.log('- cloudconvert-formats.csv (CSV format)');
console.log('- cloudconvert-report.txt (Statistics report)');
console.log('- cloudconvert-conversion-types.json (JSON format)');
console.log('- cloudconvert-grouped-list.txt (Grouped list)');


