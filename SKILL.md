---
name: remotion-video
description: Create or revise promotional videos, product explainers, reels, and animated greetings using Remotion, Edge TTS, and FFmpeg in a headless VM. Use for the Byte Encoder, Batuly, or Fabdale video workflow, Nepali Hemkala narration, or troubleshooting this workflow's headless renders.
---

# Remotion Video

Produce an editable Remotion project and a visually checked MP4 using the user's established VM workflow.

## Stack and defaults

- Use Remotion with React/TypeScript, headless Chromium, Node, Python, and FFmpeg/FFprobe.
- Build visuals with React layouts, SVG, and Canvas. Add Three.js, PixiJS, or WebGL only when the concept needs them and a browser smoke render succeeds.
- Prefer Edge TTS `ne-NP-HemkalaNeural` for Nepali narration. Confirm availability through the installed client's voice listing. Choose another voice only when requested or after reporting that Hemkala is unavailable.
- Describe the architecture accurately: editing, orchestration, mixing, and rendering run in the VM; Edge TTS is a client for Microsoft's online speech service and needs network access. It is not an offline local speech model.
- Default social reels to 1080×1920, 30 fps; landscape to 1920×1080, 30 fps. Respect supplied dimensions and duration. Export H.264 video, AAC audio when present, yuv420p, and MP4 fast-start.

## Workflow

### 1. Establish the brief and runtime

Extract brand, goal, audience, language, aspect ratio, duration, supplied assets, key message, and CTA. Use conversation context and sensible defaults; ask only for missing facts that block accurate production. For greetings, a CTA and narration are optional.

For Byte Encoder, Batuly, or Fabdale, read [brand-context.md](references/brand-context.md). Confirm current prices, offers, product claims, and contact details from supplied or authoritative sources before using them.

Inspect existing project scripts, lockfiles, installed binaries, browser availability, memory, and disk. Preserve compatible pinned dependencies; check installed API definitions and CLI help before using version-sensitive options. Record resolved versions. Store npm cache in a writable task directory when needed, without changing HOME.

Run a short composition smoke render before building the full video. If setup or rendering fails, read [headless-runtime.md](references/headless-runtime.md). Finish this step with a working render path or a precise blocker and preserved editable source.

### 2. Write narration and measure timing

Write a concise script and scene plan. Generate narration before finalizing scene timing. Use scene-level audio files to allow revisions without regenerating the whole track. For Nepali, write natural Devanagari, expand awkward abbreviations and numbers, and audition brand names and key lines when audio playback is available.

Example, after checking the installed CLI:

```bash
edge-tts --voice ne-NP-HemkalaNeural --file narration.txt --write-media narration.mp3
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 narration.mp3
```

Measure each clip, include pauses and transition room, and derive integer frame ranges from actual durations. Fit the script to a fixed runtime by rewriting or reasonable speech-rate adjustment, then regenerate and remeasure. Finish with a scene timing manifest containing audio paths, frame starts, durations, captions, and asset paths. For silent work, build the manifest directly from the visual pacing.

### 3. Build editable scenes

Keep copy, asset paths, colors, and timing in structured data. Use reusable scene components and deterministic animation driven by Remotion frames, including seeded randomness for particles. Resolve assets locally and wait for fonts and media before frame capture.

Bundle a suitable Devanagari font for Nepali text and the specified brand fonts. Use vector icons in place of platform-dependent color emoji. Check text shaping, wrapping, contrast, mobile readability, and platform overlay margins. Use real supplied product images and screenshots where accuracy matters.

Finish with a composition whose visual and audio timings match the manifest and whose assets resolve without interactive browser actions.

### 4. Preview and revise

Render a low-resolution preview, such as 540×960 for a vertical video. Extract frames about every two seconds plus scene boundaries, the first frame, and the final frame. Inspect them with an image viewer; watch or listen to the preview when supported. Fix clipping, missing glyphs, blank assets, awkward transitions, and narration/caption mismatch.

Use speech recognition only as an optional timing/transcript check; Whisper is STT, not the TTS engine. If audio cannot be auditioned, state that limitation rather than claiming listening QA.

### 5. Mix and export

Mix licensed or original music and SFX below narration, duck music during speech, prevent clipping, and fade cleanly. Normalize for the intended platform and measure the result; avoid claiming an unmeasured loudness target was met. Preserve full final narration and CTA hold time.

Render at the requested resolution and fps, then inspect representative final frames. Use ffprobe to verify dimensions, frame rate, codec, audio presence when expected, and duration. Check for audio/video cutoff and successful playback or decoding. Recheck only problems introduced by the final render.

### 6. Deliver reproducibly

Deliver the final MP4, standalone voiceover when used, and editable source archive. Include the lockfile, local fonts/media with permitted redistribution, timing manifest, render commands, any runtime workaround, and its activation instructions. Exclude node_modules, caches, secrets, and redundant intermediates. Provide runnable preview, frame-extraction, and final-render commands matching the actual project.

Persist outputs using the environment's required artifact storage workflow. Report what was checked and any unresolved limitation. Do not represent a source-only package or an uninspected render as a finished video.
