const fs = require('fs');

// Danh sách đầy đủ các conversion types cần tạo file JSON
const allMissingConversions = [
  // Archive conversions (thêm các format khác)
  { type: 'ace-to-7z', group: 'archive', input: 'ace', output: '7z' },
  { type: 'ace-to-rar', group: 'archive', input: 'ace', output: 'rar' },
  { type: 'ace-to-tar', group: 'archive', input: 'ace', output: 'tar' },
  { type: 'ace-to-zip', group: 'archive', input: 'ace', output: 'zip' },
  { type: 'alz-to-7z', group: 'archive', input: 'alz', output: '7z' },
  { type: 'alz-to-rar', group: 'archive', input: 'alz', output: 'rar' },
  { type: 'alz-to-zip', group: 'archive', input: 'alz', output: 'zip' },
  { type: 'arc-to-7z', group: 'archive', input: 'arc', output: '7z' },
  { type: 'arc-to-rar', group: 'archive', input: 'arc', output: 'rar' },
  { type: 'arc-to-zip', group: 'archive', input: 'arc', output: 'zip' },
  { type: 'arj-to-7z', group: 'archive', input: 'arj', output: '7z' },
  { type: 'arj-to-rar', group: 'archive', input: 'arj', output: 'rar' },
  { type: 'arj-to-zip', group: 'archive', input: 'arj', output: 'zip' },
  { type: 'bz-to-7z', group: 'archive', input: 'bz', output: '7z' },
  { type: 'bz-to-rar', group: 'archive', input: 'bz', output: 'rar' },
  { type: 'bz-to-zip', group: 'archive', input: 'bz', output: 'zip' },
  { type: 'bz2-to-7z', group: 'archive', input: 'bz2', output: '7z' },
  { type: 'bz2-to-rar', group: 'archive', input: 'bz2', output: 'rar' },
  { type: 'bz2-to-zip', group: 'archive', input: 'bz2', output: 'zip' },
  { type: 'cab-to-7z', group: 'archive', input: 'cab', output: '7z' },
  { type: 'cab-to-rar', group: 'archive', input: 'cab', output: 'rar' },
  { type: 'cab-to-zip', group: 'archive', input: 'cab', output: 'zip' },
  { type: 'cpio-to-7z', group: 'archive', input: 'cpio', output: '7z' },
  { type: 'cpio-to-rar', group: 'archive', input: 'cpio', output: 'rar' },
  { type: 'cpio-to-zip', group: 'archive', input: 'cpio', output: 'zip' },
  { type: 'deb-to-7z', group: 'archive', input: 'deb', output: '7z' },
  { type: 'deb-to-rar', group: 'archive', input: 'deb', output: 'rar' },
  { type: 'deb-to-zip', group: 'archive', input: 'deb', output: 'zip' },
  { type: 'dmg-to-7z', group: 'archive', input: 'dmg', output: '7z' },
  { type: 'dmg-to-rar', group: 'archive', input: 'dmg', output: 'rar' },
  { type: 'dmg-to-zip', group: 'archive', input: 'dmg', output: 'zip' },
  { type: 'gz-to-7z', group: 'archive', input: 'gz', output: '7z' },
  { type: 'gz-to-rar', group: 'archive', input: 'gz', output: 'rar' },
  { type: 'gz-to-zip', group: 'archive', input: 'gz', output: 'zip' },
  { type: 'iso-to-7z', group: 'archive', input: 'iso', output: '7z' },
  { type: 'iso-to-rar', group: 'archive', input: 'iso', output: 'rar' },
  { type: 'iso-to-zip', group: 'archive', input: 'iso', output: 'zip' },
  { type: 'lha-to-7z', group: 'archive', input: 'lha', output: '7z' },
  { type: 'lha-to-rar', group: 'archive', input: 'lha', output: 'rar' },
  { type: 'lha-to-zip', group: 'archive', input: 'lha', output: 'zip' },
  { type: 'lz-to-7z', group: 'archive', input: 'lz', output: '7z' },
  { type: 'lz-to-rar', group: 'archive', input: 'lz', output: 'rar' },
  { type: 'lz-to-zip', group: 'archive', input: 'lz', output: 'zip' },
  { type: 'lzma-to-7z', group: 'archive', input: 'lzma', output: '7z' },
  { type: 'lzma-to-rar', group: 'archive', input: 'lzma', output: 'rar' },
  { type: 'lzma-to-zip', group: 'archive', input: 'lzma', output: 'zip' },
  { type: 'lzo-to-7z', group: 'archive', input: 'lzo', output: '7z' },
  { type: 'lzo-to-rar', group: 'archive', input: 'lzo', output: 'rar' },
  { type: 'lzo-to-zip', group: 'archive', input: 'lzo', output: 'zip' },
  { type: 'msi-to-7z', group: 'archive', input: 'msi', output: '7z' },
  { type: 'msi-to-rar', group: 'archive', input: 'msi', output: 'rar' },
  { type: 'msi-to-zip', group: 'archive', input: 'msi', output: 'zip' },
  { type: 'pkg-to-7z', group: 'archive', input: 'pkg', output: '7z' },
  { type: 'pkg-to-rar', group: 'archive', input: 'pkg', output: 'rar' },
  { type: 'pkg-to-zip', group: 'archive', input: 'pkg', output: 'zip' },
  { type: 'rar-to-tar', group: 'archive', input: 'rar', output: 'tar' },
  { type: 'rpm-to-7z', group: 'archive', input: 'rpm', output: '7z' },
  { type: 'rpm-to-rar', group: 'archive', input: 'rpm', output: 'rar' },
  { type: 'rpm-to-zip', group: 'archive', input: 'rpm', output: 'zip' },
  { type: 'tar-to-7z', group: 'archive', input: 'tar', output: '7z' },
  { type: 'tar-to-rar', group: 'archive', input: 'tar', output: 'rar' },
  { type: 'tar-to-zip', group: 'archive', input: 'tar', output: 'zip' },
  { type: 'tar-bz2-to-7z', group: 'archive', input: 'tar.bz2', output: '7z' },
  { type: 'tar-bz2-to-rar', group: 'archive', input: 'tar.bz2', output: 'rar' },
  { type: 'tar-bz2-to-zip', group: 'archive', input: 'tar.bz2', output: 'zip' },
  { type: 'tar-gz-to-7z', group: 'archive', input: 'tar.gz', output: '7z' },
  { type: 'tar-gz-to-rar', group: 'archive', input: 'tar.gz', output: 'rar' },
  { type: 'tar-gz-to-zip', group: 'archive', input: 'tar.gz', output: 'zip' },
  { type: 'tar-xz-to-7z', group: 'archive', input: 'tar.xz', output: '7z' },
  { type: 'tar-xz-to-rar', group: 'archive', input: 'tar.xz', output: 'rar' },
  { type: 'tar-xz-to-zip', group: 'archive', input: 'tar.xz', output: 'zip' },
  { type: 'xz-to-7z', group: 'archive', input: 'xz', output: '7z' },
  { type: 'xz-to-rar', group: 'archive', input: 'xz', output: 'rar' },
  { type: 'xz-to-zip', group: 'archive', input: 'xz', output: 'zip' },
  { type: 'zip-to-rar', group: 'archive', input: 'zip', output: 'rar' },
  { type: 'zip-to-tar', group: 'archive', input: 'zip', output: 'tar' },
  { type: 'zip-to-tar-bz2', group: 'archive', input: 'zip', output: 'tar.bz2' },
  { type: 'zip-to-tar-gz', group: 'archive', input: 'zip', output: 'tar.gz' },
  
  // Audio conversions (thêm các format khác)
  { type: '3gp-to-m4a', group: 'audio', input: '3gp', output: 'm4a' },
  { type: '3gp-to-mp3', group: 'audio', input: '3gp', output: 'mp3' },
  { type: '3gp-to-ogg', group: 'audio', input: '3gp', output: 'ogg' },
  { type: '3gp-to-wav', group: 'audio', input: '3gp', output: 'wav' },
  { type: '3gp-to-wma', group: 'audio', input: '3gp', output: 'wma' },
  { type: 'aac-to-flac', group: 'audio', input: 'aac', output: 'flac' },
  { type: 'aac-to-m4a', group: 'audio', input: 'aac', output: 'm4a' },
  { type: 'aac-to-mp3', group: 'audio', input: 'aac', output: 'mp3' },
  { type: 'aac-to-ogg', group: 'audio', input: 'aac', output: 'ogg' },
  { type: 'aac-to-wav', group: 'audio', input: 'aac', output: 'wav' },
  { type: 'aac-to-wma', group: 'audio', input: 'aac', output: 'wma' },
  { type: 'aiff-to-flac', group: 'audio', input: 'aiff', output: 'flac' },
  { type: 'aiff-to-m4a', group: 'audio', input: 'aiff', output: 'm4a' },
  { type: 'aiff-to-mp3', group: 'audio', input: 'aiff', output: 'mp3' },
  { type: 'aiff-to-ogg', group: 'audio', input: 'aiff', output: 'ogg' },
  { type: 'aiff-to-wav', group: 'audio', input: 'aiff', output: 'wav' },
  { type: 'aiff-to-wma', group: 'audio', input: 'aiff', output: 'wma' },
  { type: 'amr-to-aiff', group: 'audio', input: 'amr', output: 'aiff' },
  { type: 'amr-to-flac', group: 'audio', input: 'amr', output: 'flac' },
  { type: 'amr-to-m4a', group: 'audio', input: 'amr', output: 'm4a' },
  { type: 'amr-to-mp3', group: 'audio', input: 'amr', output: 'mp3' },
  { type: 'amr-to-ogg', group: 'audio', input: 'amr', output: 'ogg' },
  { type: 'amr-to-wav', group: 'audio', input: 'amr', output: 'wav' },
  { type: 'amr-to-wma', group: 'audio', input: 'amr', output: 'wma' },
  { type: 'au-to-aiff', group: 'audio', input: 'au', output: 'aiff' },
  { type: 'au-to-flac', group: 'audio', input: 'au', output: 'flac' },
  { type: 'au-to-m4a', group: 'audio', input: 'au', output: 'm4a' },
  { type: 'au-to-mp3', group: 'audio', input: 'au', output: 'mp3' },
  { type: 'au-to-ogg', group: 'audio', input: 'au', output: 'ogg' },
  { type: 'au-to-wav', group: 'audio', input: 'au', output: 'wav' },
  { type: 'au-to-wma', group: 'audio', input: 'au', output: 'wma' },
  { type: 'flac-to-aiff', group: 'audio', input: 'flac', output: 'aiff' },
  { type: 'flac-to-m4a', group: 'audio', input: 'flac', output: 'm4a' },
  { type: 'flac-to-mp3', group: 'audio', input: 'flac', output: 'mp3' },
  { type: 'flac-to-ogg', group: 'audio', input: 'flac', output: 'ogg' },
  { type: 'flac-to-wav', group: 'audio', input: 'flac', output: 'wav' },
  { type: 'flac-to-wma', group: 'audio', input: 'flac', output: 'wma' },
  { type: 'm4a-to-flac', group: 'audio', input: 'm4a', output: 'flac' },
  { type: 'm4a-to-mp3', group: 'audio', input: 'm4a', output: 'mp3' },
  { type: 'm4a-to-ogg', group: 'audio', input: 'm4a', output: 'ogg' },
  { type: 'm4a-to-wav', group: 'audio', input: 'm4a', output: 'wav' },
  { type: 'm4a-to-wma', group: 'audio', input: 'm4a', output: 'wma' },
  { type: 'm4b-to-aiff', group: 'audio', input: 'm4b', output: 'aiff' },
  { type: 'm4b-to-flac', group: 'audio', input: 'm4b', output: 'flac' },
  { type: 'm4b-to-m4a', group: 'audio', input: 'm4b', output: 'm4a' },
  { type: 'm4b-to-mp3', group: 'audio', input: 'm4b', output: 'mp3' },
  { type: 'm4b-to-ogg', group: 'audio', input: 'm4b', output: 'ogg' },
  { type: 'm4b-to-wav', group: 'audio', input: 'm4b', output: 'wav' },
  { type: 'm4b-to-wma', group: 'audio', input: 'm4b', output: 'wma' },
  { type: 'm4p-to-aiff', group: 'audio', input: 'm4p', output: 'aiff' },
  { type: 'm4p-to-flac', group: 'audio', input: 'm4p', output: 'flac' },
  { type: 'm4p-to-m4a', group: 'audio', input: 'm4p', output: 'm4a' },
  { type: 'm4p-to-mp3', group: 'audio', input: 'm4p', output: 'mp3' },
  { type: 'm4p-to-ogg', group: 'audio', input: 'm4p', output: 'ogg' },
  { type: 'm4p-to-wav', group: 'audio', input: 'm4p', output: 'wav' },
  { type: 'm4p-to-wma', group: 'audio', input: 'm4p', output: 'wma' },
  { type: 'mp3-to-aiff', group: 'audio', input: 'mp3', output: 'aiff' },
  { type: 'mp3-to-flac', group: 'audio', input: 'mp3', output: 'flac' },
  { type: 'mp3-to-m4a', group: 'audio', input: 'mp3', output: 'm4a' },
  { type: 'mp3-to-ogg', group: 'audio', input: 'mp3', output: 'ogg' },
  { type: 'mp3-to-wav', group: 'audio', input: 'mp3', output: 'wav' },
  { type: 'mp3-to-wma', group: 'audio', input: 'mp3', output: 'wma' },
  { type: 'ogg-to-aiff', group: 'audio', input: 'ogg', output: 'aiff' },
  { type: 'ogg-to-flac', group: 'audio', input: 'ogg', output: 'flac' },
  { type: 'ogg-to-m4a', group: 'audio', input: 'ogg', output: 'm4a' },
  { type: 'ogg-to-mp3', group: 'audio', input: 'ogg', output: 'mp3' },
  { type: 'ogg-to-wav', group: 'audio', input: 'ogg', output: 'wav' },
  { type: 'ogg-to-wma', group: 'audio', input: 'ogg', output: 'wma' },
  { type: 'ra-to-aiff', group: 'audio', input: 'ra', output: 'aiff' },
  { type: 'ra-to-flac', group: 'audio', input: 'ra', output: 'flac' },
  { type: 'ra-to-m4a', group: 'audio', input: 'ra', output: 'm4a' },
  { type: 'ra-to-mp3', group: 'audio', input: 'ra', output: 'mp3' },
  { type: 'ra-to-ogg', group: 'audio', input: 'ra', output: 'ogg' },
  { type: 'ra-to-wav', group: 'audio', input: 'ra', output: 'wav' },
  { type: 'ra-to-wma', group: 'audio', input: 'ra', output: 'wma' },
  { type: 'wav-to-aiff', group: 'audio', input: 'wav', output: 'aiff' },
  { type: 'wav-to-flac', group: 'audio', input: 'wav', output: 'flac' },
  { type: 'wav-to-m4a', group: 'audio', input: 'wav', output: 'm4a' },
  { type: 'wav-to-mp3', group: 'audio', input: 'wav', output: 'mp3' },
  { type: 'wav-to-ogg', group: 'audio', input: 'wav', output: 'ogg' },
  { type: 'wav-to-wma', group: 'audio', input: 'wav', output: 'wma' },
  { type: 'wma-to-aiff', group: 'audio', input: 'wma', output: 'aiff' },
  { type: 'wma-to-flac', group: 'audio', input: 'wma', output: 'flac' },
  { type: 'wma-to-m4a', group: 'audio', input: 'wma', output: 'm4a' },
  { type: 'wma-to-mp3', group: 'audio', input: 'wma', output: 'mp3' },
  { type: 'wma-to-ogg', group: 'audio', input: 'wma', output: 'ogg' },
  { type: 'wma-to-wav', group: 'audio', input: 'wma', output: 'wav' },
  { type: 'wv-to-aiff', group: 'audio', input: 'wv', output: 'aiff' },
  { type: 'wv-to-flac', group: 'audio', input: 'wv', output: 'flac' },
  { type: 'wv-to-m4a', group: 'audio', input: 'wv', output: 'm4a' },
  { type: 'wv-to-mp3', group: 'audio', input: 'wv', output: 'mp3' },
  { type: 'wv-to-ogg', group: 'audio', input: 'wv', output: 'ogg' },
  { type: 'wv-to-wav', group: 'audio', input: 'wv', output: 'wav' },
  { type: 'wv-to-wma', group: 'audio', input: 'wv', output: 'wma' }
];

// Template cho file JSON
function createJsonTemplate(conversion) {
  const title = `Convert ${conversion.input.toUpperCase()} to ${conversion.output.toUpperCase()}`;
  const description = `Convert ${conversion.input.toUpperCase()} files to ${conversion.output.toUpperCase()} format online for free.`;
  
  return {
    "title": `${title} - Free Online Converter`,
    "description": description,
    "keywords": `${conversion.input} to ${conversion.output}, convert ${conversion.input} to ${conversion.output}, ${conversion.input} ${conversion.output} converter, free online converter`,
    "og_title": `${title} - Free Online Converter`,
    "og_description": description,
    "og_image": `/images/${conversion.group}-converter.jpg`,
    "twitter_title": `${title} - Free Online Converter`,
    "twitter_description": description,
    "canonical_url": `/en/${conversion.group}/convert-${conversion.type}`,
    "schema": {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": title,
      "description": description,
      "image": `/images/${conversion.group}-converter.jpg`,
      "totalTime": "PT2M",
      "estimatedCost": {
        "@type": "MonetaryAmount",
        "currency": "USD",
        "value": "0"
      },
      "step": [
        {
          "@type": "HowToStep",
          "name": `Upload ${conversion.input.toUpperCase()} file`,
          "text": `Click the upload area or drag and drop your ${conversion.input.toUpperCase()} file`,
          "image": "/images/upload-step.jpg"
        },
        {
          "@type": "HowToStep", 
          "name": `Convert to ${conversion.output.toUpperCase()}`,
          "text": "Click the convert button to start the conversion process",
          "image": "/images/convert-step.jpg"
        },
        {
          "@type": "HowToStep",
          "name": `Download ${conversion.output.toUpperCase()} file`,
          "text": `Download your converted ${conversion.output.toUpperCase()} file when ready`,
          "image": "/images/download-step.jpg"
        }
      ]
    },
    "breadcrumb": [
      {
        "name": "Home",
        "url": "/en/"
      },
      {
        "name": `${conversion.group.charAt(0).toUpperCase() + conversion.group.slice(1)} Converter`,
        "url": `/en/${conversion.group}/converter`
      },
      {
        "name": `${conversion.input.toUpperCase()} to ${conversion.output.toUpperCase()}`,
        "url": `/en/${conversion.group}/convert-${conversion.type}`
      }
    ],
    "converter": {
      "title": title,
      "subtitle": `Convert ${conversion.input.toUpperCase()} files to ${conversion.output.toUpperCase()} format`,
      "description": `Upload your ${conversion.input.toUpperCase()} file and convert it to ${conversion.output.toUpperCase()} format quickly and securely.`,
      "supported_formats": {
        "input": [conversion.input],
        "output": [conversion.output]
      },
      "features": [
        "Free online conversion",
        "No registration required", 
        "Secure file processing",
        "Fast conversion speed",
        "Works on all devices"
      ],
      "instructions": [
        `Click the upload area or drag and drop your ${conversion.input.toUpperCase()} file`,
        "Wait for the file to upload and process",
        `Click 'Convert to ${conversion.output.toUpperCase()}' to start conversion`,
        `Download your ${conversion.output.toUpperCase()} file when ready`
      ],
      "tips": [
        "Maximum file size: 100MB",
        `Supported ${conversion.input.toUpperCase()} formats`,
        `High quality ${conversion.output.toUpperCase()} output`,
        "Fast and secure conversion"
      ]
    }
  };
}

// Hàm tạo file JSON
function generateJsonFile(conversion) {
  const jsonContent = createJsonTemplate(conversion);
  const filePath = `locales/en/${conversion.group}/convert-${conversion.type}.json`;
  
  // Đảm bảo thư mục tồn tại
  const dir = `locales/en/${conversion.group}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2));
  console.log(`✅ Created: ${filePath}`);
}

// Main execution
console.log('Generating ALL missing JSON files...\n');

allMissingConversions.forEach(conversion => {
  generateJsonFile(conversion);
});

console.log(`\n🎉 Generated ${allMissingConversions.length} JSON files!`);

// Tạo báo cáo
let report = '=== ALL GENERATED FILES REPORT ===\n\n';
const groupedByCategory = {};

allMissingConversions.forEach(conv => {
  if (!groupedByCategory[conv.group]) {
    groupedByCategory[conv.group] = [];
  }
  groupedByCategory[conv.group].push(conv.type);
});

Object.keys(groupedByCategory).sort().forEach(group => {
  report += `${group.toUpperCase()}:\n`;
  groupedByCategory[group].forEach(type => {
    report += `  - convert-${type}.json\n`;
  });
  report += '\n';
});

fs.writeFileSync('all-generated-files-report.txt', report);
console.log('✅ Created: all-generated-files-report.txt');


