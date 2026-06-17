# 🎞️ Scroll Hero — swapping in a Higgsfield video

The `/showcase` page scrubs through a **JPEG frame sequence** on a canvas as you
scroll (no `<video>` element). To use your own Higgsfield-generated hero, you only
need to drop in the video and run one command — **no code changes**.

## 1. Generate the video in Higgsfield

Use a **pure black background** so it blends with the page. Suggested ParkEase prompts:

**Base image**
> A studio product shot of a sleek modern car settling into a single illuminated
> smart-parking bay. Minimalist dark concrete garage, near-black background, a
> violet-to-magenta LED outline glowing around the parking bay on the floor.
> Clean, cinematic, high-end tech campaign look. No text, no logos, no people.

**Hero video** (use the image as reference)
> The car glides smoothly forward into the glowing violet parking bay in a pure
> black void. As it settles, the bay's LED outline pulses and brightens and a soft
> holographic "reserved" ring forms beneath it. The camera performs one slow
> cinematic orbit. Motion is calm and premium — never fast. Pure black background,
> no environment, no text.

Export it and name it **`hero.mp4`**.

## 2. Drop it in and extract frames

Put `hero.mp4` in `client/public/` and run (needs `ffmpeg` — `brew install ffmpeg`):

```bash
cd client
npm run frames                      # or: npm run frames -- /path/to/hero.mp4
```

This will:
- print the video's resolution / fps / duration (ffprobe),
- extract frames at **24 fps, 1920px wide** into `public/frames/frame_0001.jpg …`,
- write `public/frames/manifest.json` with the new frame count,
- keep a copy at `public/hero.mp4`.

## 3. Done

`ScrollHero` reads `manifest.json` at runtime, so the new frame count is picked up
automatically. Reload `/showcase` and scroll — the hero now scrubs your Higgsfield
video frame by frame.

> The hero copy, sections, and styling stay the same; only the frames change.
> Want different framing/copy for the new footage? Tell me and I'll adjust.
