const fs = require('fs');

// Dữ liệu đầy đủ từ CloudConvert API (đã được cung cấp)
const cloudConvertData = {
  "data": [
    {"operation":"convert","input_format":"7z","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"7z","output_format":"tar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"7z","output_format":"tar.bz2","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"7z","output_format":"tar.gz","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"7z","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"ace","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"ace","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"ace","output_format":"tar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"ace","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"alz","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"alz","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"alz","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"arc","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"arc","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"arc","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"arj","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"arj","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"arj","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"bz","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"bz","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"bz","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"bz2","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"bz2","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"bz2","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"cab","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"cab","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"cab","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"cpio","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"cpio","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"cpio","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"deb","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"deb","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"deb","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"dmg","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"dmg","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"dmg","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"gz","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"gz","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"gz","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"iso","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"iso","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"iso","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"lha","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"lha","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"lha","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"lz","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"lz","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"lz","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"lzma","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"lzma","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"lzma","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"lzo","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"lzo","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"lzo","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"msi","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"msi","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"msi","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"pkg","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"pkg","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"pkg","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"rar","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"rar","output_format":"tar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"rar","output_format":"tar.bz2","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"rar","output_format":"tar.gz","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"rar","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"rpm","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"rpm","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"rpm","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"tar","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"tar","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"tar","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"tar.bz2","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"tar.bz2","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"tar.bz2","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"tar.gz","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"tar.gz","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"tar.gz","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"tar.xz","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"tar.xz","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"tar.xz","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"xz","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"xz","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"xz","output_format":"zip","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"zip","output_format":"7z","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"zip","output_format":"rar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"zip","output_format":"tar","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"zip","output_format":"tar.bz2","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"zip","output_format":"tar.gz","engine":"archivetool","credits":1,"meta":{"group":"archive"}},
    {"operation":"convert","input_format":"3gp","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"3gp","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"3gp","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"3gp","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"3gp","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"3gp","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"3gp","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aac","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aac","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aac","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aac","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aac","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aac","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aac","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aiff","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aiff","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aiff","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aiff","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aiff","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aiff","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"aiff","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"amr","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"amr","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"amr","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"amr","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"amr","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"amr","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"amr","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"amr","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"au","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"au","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"au","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"au","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"au","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"au","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"au","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"au","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"flac","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"flac","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"flac","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"flac","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"flac","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"flac","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"flac","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4a","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4a","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4a","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4a","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4a","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4a","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4a","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4b","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4b","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4b","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4b","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4b","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4b","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4b","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4b","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4p","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4p","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4p","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4p","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4p","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4p","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4p","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"m4p","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"mp3","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"mp3","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"mp3","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"mp3","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"mp3","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"mp3","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"mp3","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ogg","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ogg","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ogg","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ogg","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ogg","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ogg","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ogg","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ra","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ra","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ra","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ra","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ra","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ra","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ra","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"ra","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wav","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wav","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wav","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wav","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wav","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wav","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wav","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wma","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wma","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wma","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wma","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wma","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wma","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wma","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wv","output_format":"aac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wv","output_format":"aiff","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wv","output_format":"flac","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wv","output_format":"m4a","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wv","output_format":"mp3","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wv","output_format":"ogg","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wv","output_format":"wav","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}},
    {"operation":"convert","input_format":"wv","output_format":"wma","engine":"ffmpeg","credits":1,"meta":{"group":"audio"}}
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
  
  let report = '=== FULL CLOUDCONVERT FORMATS REPORT ===\n\n';
  
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
console.log('Extracting FULL CloudConvert formats...\n');

// Tạo CSV
const csvContent = generateCSV();
fs.writeFileSync('cloudconvert-full-formats.csv', csvContent);
console.log('✅ Created: cloudconvert-full-formats.csv');

// Tạo báo cáo
const report = generateReport();
fs.writeFileSync('cloudconvert-full-report.txt', report);
console.log('✅ Created: cloudconvert-full-report.txt');

// Tạo danh sách conversion types
const conversionTypes = generateConversionTypes();
const conversionTypesJson = JSON.stringify(conversionTypes, null, 2);
fs.writeFileSync('cloudconvert-full-conversion-types.json', conversionTypesJson);
console.log('✅ Created: cloudconvert-full-conversion-types.json');

// Tạo danh sách theo nhóm
const groupedConversions = {};
conversionTypes.forEach(conv => {
  if (!groupedConversions[conv.group]) {
    groupedConversions[conv.group] = [];
  }
  groupedConversions[conv.group].push(conv.type);
});

let groupedList = '=== FULL CONVERSION TYPES BY GROUP ===\n\n';
Object.keys(groupedConversions).sort().forEach(group => {
  groupedList += `${group.toUpperCase()}:\n`;
  groupedConversions[group].forEach(type => {
    groupedList += `  - ${type}\n`;
  });
  groupedList += '\n';
});

fs.writeFileSync('cloudconvert-full-grouped-list.txt', groupedList);
console.log('✅ Created: cloudconvert-full-grouped-list.txt');

console.log('\n🎉 Full extraction completed! Check the generated files:');
console.log('- cloudconvert-full-formats.csv (Full CSV format)');
console.log('- cloudconvert-full-report.txt (Full statistics report)');
console.log('- cloudconvert-full-conversion-types.json (Full JSON format)');
console.log('- cloudconvert-full-grouped-list.txt (Full grouped list)');


