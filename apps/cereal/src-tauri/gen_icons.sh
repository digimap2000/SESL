#!/bin/bash

# Usage: ./generate-icons.sh input.png
# Requires: ImageMagick, iconutil (macOS only for icns)

if [ $# -ne 1 ]; then
  echo "Usage: $0 path/to/input.png"
  exit 1
fi

INPUT=$1
BASENAME=$(basename "$INPUT" .png)
OUTPUT_DIR="icons"

mkdir -p $OUTPUT_DIR

echo "Generating resized PNGs..."

declare -a sizes=(16 32 48 64 128 256 512)

for size in "${sizes[@]}"; do
  magick "$INPUT" -resize ${size}x${size} -define png:color-type=6 "$OUTPUT_DIR/${size}x${size}.png"
done

echo "Creating multi-resolution .ico file (Windows)..."
magick "$OUTPUT_DIR/16x16.png" "$OUTPUT_DIR/32x32.png" "$OUTPUT_DIR/48x48.png" "$OUTPUT_DIR/icon.ico"

# macOS iconset folder
ICONSET_DIR="$OUTPUT_DIR/${BASENAME}.iconset"
mkdir -p "$ICONSET_DIR"

echo "Preparing .iconset folder for macOS..."
cp "$OUTPUT_DIR/16x16.png"   "$ICONSET_DIR/icon_16x16.png"
cp "$OUTPUT_DIR/16x16.png"   "$ICONSET_DIR/icon_16x16@2x.png" # 32x32 (doubling 16)
cp "$OUTPUT_DIR/32x32.png"   "$ICONSET_DIR/icon_32x32.png"
cp "$OUTPUT_DIR/32x32.png"   "$ICONSET_DIR/icon_32x32@2x.png" # 64x64
cp "$OUTPUT_DIR/128x128.png"  "$ICONSET_DIR/icon_128x128.png"
cp "$OUTPUT_DIR/128x128.png"  "$ICONSET_DIR/icon_128x128@2x.png" # 256x256
cp "$OUTPUT_DIR/256x256.png"  "$ICONSET_DIR/icon_256x256.png"
cp "$OUTPUT_DIR/256x256.png"  "$ICONSET_DIR/icon_256x256@2x.png" # 512x512
cp "$OUTPUT_DIR/512x512.png"  "$ICONSET_DIR/icon_512x512.png"

# Create @2x files (2x size) by resizing smaller images if needed
magick "$OUTPUT_DIR/16x16.png" -resize 32x32 "$ICONSET_DIR/icon_16x16@2x.png"
magick "$OUTPUT_DIR/32x32.png" -resize 64x64 "$ICONSET_DIR/icon_32x32@2x.png"
magick "$OUTPUT_DIR/128x128.png" -resize 256x256 "$ICONSET_DIR/icon_128x128@2x.png"
magick "$OUTPUT_DIR/256x256.png" -resize 512x512 "$ICONSET_DIR/icon_256x256@2x.png"

if command -v iconutil >/dev/null 2>&1; then
  echo "Generating .icns file (macOS)..."
  iconutil -c icns "$ICONSET_DIR" -o "$OUTPUT_DIR/icon.icns"
else
  echo "Warning: iconutil not found. Skipping .icns generation."
fi

echo "All done! Icons saved in $OUTPUT_DIR"
