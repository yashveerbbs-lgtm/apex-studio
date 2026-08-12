#!/bin/bash

echo "🧠 Building High-Density Architecture Map for Apex Studio..."

OUTPUT="apex-codebase.txt"
> $OUTPUT

# 1. Output the Full Project Directory Tree
echo "==================================================================" >> $OUTPUT
echo "PROJECT DIRECTORY TREE" >> $OUTPUT
echo "==================================================================" >> $OUTPUT
find . -maxdepth 4 -not -path '*/.*' -not -path '*/node_modules*' >> $OUTPUT

# 2. Extract and Minify Code (Keep Logic & Structure, Strip Fluff)
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/.git/*" | while read -r file; do
    echo -e "\n\n==================================================================" >> $OUTPUT
    echo "FILE: $file" >> $OUTPUT
    echo "==================================================================" >> $OUTPUT
    
    # Strip empty lines and excess spaces to maximize token efficiency
    sed '/^[[:space:]]*$/d' "$file" >> $OUTPUT
done

echo "✅ Optimization Complete! Compressed codebase written to $OUTPUT"