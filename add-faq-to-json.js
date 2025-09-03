const fs = require('fs');
const path = require('path');

const files = [
  'convert-jpg-to-tiff.json',
  'convert-png-to-tiff.json',
  'convert-jpg-to-bmp.json',
  'convert-png-to-bmp.json',
  'convert-jpg-to-avif.json',
  'convert-png-to-avif.json',
  'convert-webp-to-avif.json',
  'convert-bmp-to-ico.json',
  'convert-tiff-to-ico.json',
  'convert-webp-to-ico.json'
];

const faqContent = {
  'convert-jpg-to-tiff.json': [
    {
      "question": "Is this JPG to TIFF converter free?",
      "answer": "Yes, the converter is completely free with no hidden charges or subscriptions."
    },
    {
      "question": "Will TIFF work on all applications?",
      "answer": "TIFF is supported by most professional applications including Photoshop, Illustrator, and printing software."
    },
    {
      "question": "How much larger are TIFF files compared to JPG?",
      "answer": "TIFF files are typically 3-10 times larger than JPG files due to lossless compression."
    },
    {
      "question": "What file sizes are supported?",
      "answer": "You can upload images up to 100MB. For larger files, try compressing them first."
    },
    {
      "question": "Are my files safe?",
      "answer": "Yes. All files are encrypted, processed on secure servers, and automatically deleted after conversion."
    },
    {
      "question": "Can I convert multiple JPGs at once?",
      "answer": "Yes, our tool supports batch conversion. Simply upload multiple files and download them all as TIFF."
    },
    {
      "question": "Is TIFF better than JPG for printing?",
      "answer": "Yes, TIFF provides better quality for professional printing and archival purposes."
    }
  ],
  'convert-png-to-tiff.json': [
    {
      "question": "Is this PNG to TIFF converter free?",
      "answer": "Yes, the converter is completely free with no hidden charges or subscriptions."
    },
    {
      "question": "Will TIFF work on all applications?",
      "answer": "TIFF is supported by most professional applications including Photoshop, Illustrator, and printing software."
    },
    {
      "question": "How much larger are TIFF files compared to PNG?",
      "answer": "TIFF files are typically 2-5 times larger than PNG files due to different compression methods."
    },
    {
      "question": "What file sizes are supported?",
      "answer": "You can upload images up to 100MB. For larger files, try compressing them first."
    },
    {
      "question": "Are my files safe?",
      "answer": "Yes. All files are encrypted, processed on secure servers, and automatically deleted after conversion."
    },
    {
      "question": "Can I convert multiple PNGs at once?",
      "answer": "Yes, our tool supports batch conversion. Simply upload multiple files and download them all as TIFF."
    },
    {
      "question": "Is TIFF better than PNG for printing?",
      "answer": "Yes, TIFF provides better quality for professional printing and archival purposes."
    }
  ],
  'convert-jpg-to-bmp.json': [
    {
      "question": "Is this JPG to BMP converter free?",
      "answer": "Yes, the converter is completely free with no hidden charges or subscriptions."
    },
    {
      "question": "Will BMP work on all applications?",
      "answer": "BMP is supported by most Windows applications and some other operating systems."
    },
    {
      "question": "How much larger are BMP files compared to JPG?",
      "answer": "BMP files are typically 5-20 times larger than JPG files due to no compression."
    },
    {
      "question": "What file sizes are supported?",
      "answer": "You can upload images up to 100MB. For larger files, try compressing them first."
    },
    {
      "question": "Are my files safe?",
      "answer": "Yes. All files are encrypted, processed on secure servers, and automatically deleted after conversion."
    },
    {
      "question": "Can I convert multiple JPGs at once?",
      "answer": "Yes, our tool supports batch conversion. Simply upload multiple files and download them all as BMP."
    },
    {
      "question": "Is BMP better than JPG for editing?",
      "answer": "BMP has no compression artifacts, making it better for repeated editing."
    }
  ],
  'convert-png-to-bmp.json': [
    {
      "question": "Is this PNG to BMP converter free?",
      "answer": "Yes, the converter is completely free with no hidden charges or subscriptions."
    },
    {
      "question": "Will BMP work on all applications?",
      "answer": "BMP is supported by most Windows applications and some other operating systems."
    },
    {
      "question": "How much larger are BMP files compared to PNG?",
      "answer": "BMP files are typically 3-10 times larger than PNG files due to no compression."
    },
    {
      "question": "What file sizes are supported?",
      "answer": "You can upload images up to 100MB. For larger files, try compressing them first."
    },
    {
      "question": "Are my files safe?",
      "answer": "Yes. All files are encrypted, processed on secure servers, and automatically deleted after conversion."
    },
    {
      "question": "Can I convert multiple PNGs at once?",
      "answer": "Yes, our tool supports batch conversion. Simply upload multiple files and download them all as BMP."
    },
    {
      "question": "Is BMP better than PNG for editing?",
      "answer": "BMP has no compression artifacts, making it better for repeated editing."
    }
  ],
  'convert-jpg-to-avif.json': [
    {
      "question": "Is this JPG to AVIF converter free?",
      "answer": "Yes, the converter is completely free with no hidden charges or subscriptions."
    },
    {
      "question": "Will AVIF work on all browsers?",
      "answer": "AVIF is supported by modern browsers (Chrome, Firefox, Safari, Edge). For older browsers, provide JPG fallbacks."
    },
    {
      "question": "How much smaller are AVIF files compared to JPG?",
      "answer": "AVIF files are typically 30-50% smaller than JPG files while maintaining the same quality."
    },
    {
      "question": "What file sizes are supported?",
      "answer": "You can upload images up to 100MB. For larger files, try compressing them first."
    },
    {
      "question": "Are my files safe?",
      "answer": "Yes. All files are encrypted, processed on secure servers, and automatically deleted after conversion."
    },
    {
      "question": "Can I convert multiple JPGs at once?",
      "answer": "Yes, our tool supports batch conversion. Simply upload multiple files and download them all as AVIF."
    },
    {
      "question": "Is AVIF better than JPG for websites?",
      "answer": "Yes, AVIF provides better compression and quality, making it ideal for web use."
    }
  ],
  'convert-png-to-avif.json': [
    {
      "question": "Is this PNG to AVIF converter free?",
      "answer": "Yes, the converter is completely free with no hidden charges or subscriptions."
    },
    {
      "question": "Will AVIF work on all browsers?",
      "answer": "AVIF is supported by modern browsers (Chrome, Firefox, Safari, Edge). For older browsers, provide PNG fallbacks."
    },
    {
      "question": "How much smaller are AVIF files compared to PNG?",
      "answer": "AVIF files are typically 30-50% smaller than PNG files while maintaining the same quality."
    },
    {
      "question": "What file sizes are supported?",
      "answer": "You can upload images up to 100MB. For larger files, try compressing them first."
    },
    {
      "question": "Are my files safe?",
      "answer": "Yes. All files are encrypted, processed on secure servers, and automatically deleted after conversion."
    },
    {
      "question": "Can I convert multiple PNGs at once?",
      "answer": "Yes, our tool supports batch conversion. Simply upload multiple files and download them all as AVIF."
    },
    {
      "question": "Is AVIF better than PNG for websites?",
      "answer": "Yes, AVIF provides better compression and quality, making it ideal for web use."
    }
  ],
  'convert-webp-to-avif.json': [
    {
      "question": "Is this WebP to AVIF converter free?",
      "answer": "Yes, the converter is completely free with no hidden charges or subscriptions."
    },
    {
      "question": "Will AVIF work on all browsers?",
      "answer": "AVIF is supported by modern browsers (Chrome, Firefox, Safari, Edge). For older browsers, provide WebP fallbacks."
    },
    {
      "question": "How much smaller are AVIF files compared to WebP?",
      "answer": "AVIF files are typically 20-30% smaller than WebP files while maintaining the same quality."
    },
    {
      "question": "What file sizes are supported?",
      "answer": "You can upload images up to 100MB. For larger files, try compressing them first."
    },
    {
      "question": "Are my files safe?",
      "answer": "Yes. All files are encrypted, processed on secure servers, and automatically deleted after conversion."
    },
    {
      "question": "Can I convert multiple WebPs at once?",
      "answer": "Yes, our tool supports batch conversion. Simply upload multiple files and download them all as AVIF."
    },
    {
      "question": "Is AVIF better than WebP for websites?",
      "answer": "Yes, AVIF provides better compression and quality, making it ideal for web use."
    }
  ],
  'convert-bmp-to-ico.json': [
    {
      "question": "Is this BMP to ICO converter free?",
      "answer": "Yes, the converter is completely free with no hidden charges or subscriptions."
    },
    {
      "question": "Will ICO work on all operating systems?",
      "answer": "ICO is supported by Windows, macOS, and Linux operating systems."
    },
    {
      "question": "What sizes are supported for ICO files?",
      "answer": "ICO files typically support 16x16, 32x32, 48x48, and 256x256 pixel sizes."
    },
    {
      "question": "What file sizes are supported?",
      "answer": "You can upload images up to 100MB. For larger files, try compressing them first."
    },
    {
      "question": "Are my files safe?",
      "answer": "Yes. All files are encrypted, processed on secure servers, and automatically deleted after conversion."
    },
    {
      "question": "Can I convert multiple BMPs at once?",
      "answer": "Yes, our tool supports batch conversion. Simply upload multiple files and download them all as ICO."
    },
    {
      "question": "Is ICO better than BMP for icons?",
      "answer": "Yes, ICO is specifically designed for icons and supports multiple resolutions in one file."
    }
  ],
  'convert-tiff-to-ico.json': [
    {
      "question": "Is this TIFF to ICO converter free?",
      "answer": "Yes, the converter is completely free with no hidden charges or subscriptions."
    },
    {
      "question": "Will ICO work on all operating systems?",
      "answer": "ICO is supported by Windows, macOS, and Linux operating systems."
    },
    {
      "question": "What sizes are supported for ICO files?",
      "answer": "ICO files typically support 16x16, 32x32, 48x48, and 256x256 pixel sizes."
    },
    {
      "question": "What file sizes are supported?",
      "answer": "You can upload images up to 100MB. For larger files, try compressing them first."
    },
    {
      "question": "Are my files safe?",
      "answer": "Yes. All files are encrypted, processed on secure servers, and automatically deleted after conversion."
    },
    {
      "question": "Can I convert multiple TIFFs at once?",
      "answer": "Yes, our tool supports batch conversion. Simply upload multiple files and download them all as ICO."
    },
    {
      "question": "Is ICO better than TIFF for icons?",
      "answer": "Yes, ICO is specifically designed for icons and supports multiple resolutions in one file."
    }
  ],
  'convert-webp-to-ico.json': [
    {
      "question": "Is this WebP to ICO converter free?",
      "answer": "Yes, the converter is completely free with no hidden charges or subscriptions."
    },
    {
      "question": "Will ICO work on all operating systems?",
      "answer": "ICO is supported by Windows, macOS, and Linux operating systems."
    },
    {
      "question": "What sizes are supported for ICO files?",
      "answer": "ICO files typically support 16x16, 32x32, 48x48, and 256x256 pixel sizes."
    },
    {
      "question": "What file sizes are supported?",
      "answer": "You can upload images up to 100MB. For larger files, try compressing them first."
    },
    {
      "question": "Are my files safe?",
      "answer": "Yes. All files are encrypted, processed on secure servers, and automatically deleted after conversion."
    },
    {
      "question": "Can I convert multiple WebPs at once?",
      "answer": "Yes, our tool supports batch conversion. Simply upload multiple files and download them all as ICO."
    },
    {
      "question": "Is ICO better than WebP for icons?",
      "answer": "Yes, ICO is specifically designed for icons and supports multiple resolutions in one file."
    }
  ]
};

files.forEach(filename => {
  const filePath = path.join('locales/en/image', filename);
  if (fs.existsSync(filePath)) {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Add FAQ content if it doesn't exist
    if (!content.faq) {
      content.faq = faqContent[filename];
      
      // Write back to file
      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
      console.log(`✅ Added FAQ to ${filename}`);
    } else {
      console.log(`⏭️  ${filename} already has FAQ content`);
    }
  } else {
    console.log(`❌ File not found: ${filename}`);
  }
});

console.log('🎉 All FAQ content added!');

