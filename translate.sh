#!/bin/bash

# Script để dịch các file JSON bằng Gemini AI
# Sử dụng: ./translate.sh [API_KEY]

echo "🌐 JSON Translation Script with Gemini AI"
echo "========================================"

# Kiểm tra API key
if [ -n "$1" ]; then
    export GEMINI_API_KEY="$1"
    echo "✅ Using API key from command line argument"
elif [ -n "$GEMINI_API_KEY" ]; then
    echo "✅ Using API key from environment variable"
else
    echo "❌ No API key provided!"
    echo "Usage: ./translate.sh YOUR_API_KEY"
    echo "Or set environment variable: export GEMINI_API_KEY=YOUR_API_KEY"
    exit 1
fi

# Kiểm tra file script tồn tại
if [ ! -f "translate-json.js" ]; then
    echo "❌ translate-json.js not found!"
    exit 1
fi

# Chạy script dịch thuật
echo "🚀 Starting translation..."
node translate-json.js

echo "✅ Translation script completed!"



