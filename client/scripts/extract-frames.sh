#!/usr/bin/env bash
# Extract a Higgsfield (or any) hero video into the JPEG frame sequence the
# scroll hero scrubs through. Drop your video in and run `npm run frames`.
#
# Usage:
#   npm run frames                 # uses ./hero.mp4 or ./public/hero.mp4
#   npm run frames -- path/to/hero.mp4
#
# Requires ffmpeg + ffprobe (macOS: `brew install ffmpeg`).
set -euo pipefail

CLIENT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$CLIENT_DIR"

# Locate the source video
SRC="${1:-}"
if [ -z "$SRC" ]; then
  if [ -f "public/hero.mp4" ]; then SRC="public/hero.mp4";
  elif [ -f "hero.mp4" ]; then SRC="hero.mp4";
  elif [ -f "../hero.mp4" ]; then SRC="../hero.mp4";
  fi
fi

if [ -z "$SRC" ] || [ ! -f "$SRC" ]; then
  echo "❌ No hero video found. Place hero.mp4 in client/public/ (or pass a path):"
  echo "   npm run frames -- /path/to/hero.mp4"
  exit 1
fi

command -v ffmpeg >/dev/null 2>&1 || { echo "❌ ffmpeg not found. Install it: brew install ffmpeg"; exit 1; }

echo "🎬 Source: $SRC"
echo "── ffprobe ─────────────────────────────"
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,nb_frames,duration \
  -of default=noprint_wrappers=1 "$SRC" || true
echo "────────────────────────────────────────"

# Keep the video served too (optional poster / fallback)
mkdir -p public/frames
cp "$SRC" public/hero.mp4 2>/dev/null || true

# Clear old frames, extract new ones at 24fps / 1920px wide
rm -f public/frames/frame_*.jpg
ffmpeg -loglevel error -i "$SRC" -vf "fps=24,scale=1920:-1" -q:v 3 \
  "public/frames/frame_%04d.jpg"

COUNT=$(ls public/frames/frame_*.jpg 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -eq 0 ]; then echo "❌ No frames produced."; exit 1; fi

printf '{ "count": %s }\n' "$COUNT" > public/frames/manifest.json
echo "✅ Extracted $COUNT frames → public/frames/ (manifest.json updated)"
echo "   The scroll hero will pick up the new count automatically."
