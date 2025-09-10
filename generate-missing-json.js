const fs = require('fs');

// Danh sách các conversion types cần tạo file JSON
const missingConversions = [
  // Archive conversions
  { type: '7z-to-rar', group: 'archive', input: '7z', output: 'rar' },
  { type: '7z-to-tar', group: 'archive', input: '7z', output: 'tar' },
  { type: 'rar-to-7z', group: 'archive', input: 'rar', output: '7z' },
  { type: 'zip-to-7z', group: 'archive', input: 'zip', output: '7z' },
  
  // Audio conversions (một số ví dụ)
  { type: '3gp-to-aiff', group: 'audio', input: '3gp', output: 'aiff' },
  { type: '3gp-to-flac', group: 'audio', input: '3gp', output: 'flac' },
  { type: 'aac-to-aiff', group: 'audio', input: 'aac', output: 'aiff' },
  { type: 'aiff-to-aac', group: 'audio', input: 'aiff', output: 'aac' },
  { type: 'amr-to-aac', group: 'audio', input: 'amr', output: 'aac' },
  { type: 'au-to-aac', group: 'audio', input: 'au', output: 'aac' },
  { type: 'flac-to-aac', group: 'audio', input: 'flac', output: 'aac' },
  { type: 'm4b-to-aac', group: 'audio', input: 'm4b', output: 'aac' },
  { type: 'm4p-to-aac', group: 'audio', input: 'm4p', output: 'aac' },
  { type: 'ogg-to-aac', group: 'audio', input: 'ogg', output: 'aac' },
  { type: 'ra-to-aac', group: 'audio', input: 'ra', output: 'aac' },
  { type: 'wav-to-aac', group: 'audio', input: 'wav', output: 'aac' },
  { type: 'wma-to-aac', group: 'audio', input: 'wma', output: 'aac' },
  { type: 'wv-to-aac', group: 'audio', input: 'wv', output: 'aac' }
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
    // Twitter meta tags removed
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
console.log('Generating missing JSON files...\n');

missingConversions.forEach(conversion => {
  generateJsonFile(conversion);
});

console.log(`\n🎉 Generated ${missingConversions.length} JSON files!`);

// Tạo báo cáo
let report = '=== GENERATED FILES REPORT ===\n\n';
const groupedByCategory = {};

missingConversions.forEach(conv => {
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

fs.writeFileSync('generated-files-report.txt', report);
console.log('✅ Created: generated-files-report.txt');


