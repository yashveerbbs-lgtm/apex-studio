#!/bin/bash

echo "🧠 Bundling Apex Studio Codebase for Deep Learning..."

# Create or clear the output file
OUTPUT="apex-codebase.txt"
> $OUTPUT

# Find all relevant code files, ignoring the heavy junk folders
find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.css" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/.git/*" | while read -r file; do
    echo -e "\n\n==================================================================" >> $OUTPUT
    echo "FILE PATH: $file" >> $OUTPUT
    echo "==================================================================" >> $OUTPUT
    cat "$file" >> $OUTPUT
done

echo "✅ Done! Your entire project is securely bundled into $OUTPUT"