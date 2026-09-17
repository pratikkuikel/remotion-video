---
name: remotion-video
description: Create or revise promotional videos, product explainers, reels, and animated greetings using Remotion, Edge TTS, and FFmpeg in a headless VM. Supports autonomous YOLO production or a guided creative interview covering script, photos, footage, scene timing, and target platform. Use for Byte Encoder, Batuly, Fabdale, Nepali Hemkala narration, or troubleshooting headless renders.
---

# Remotion Video

Produce an editable Remotion project and a visually checked MP4 using the user's established VM workflow.

## Choose the collaboration mode

- **YOLO:** When the user says “YOLO,” “surprise me,” “any video you like,” or otherwise delegates creative decisions, use the available context and assets, choose a defensible concept, and complete the video. State key assumptions and seek input only for a genuine blocker. This is also the default when the user asks for a finished video without asking to plan it together.
- **Guided:** When the user asks to brainstorm, direct the video, approve the script, choose photos or footage, or be asked for details, follow [creative-brief.md](references/creative-brief.md). Discuss the concept and script first; then map every scene's visuals, supplied assets, motion, words, and timing before building. Present a preview for feedback and revise. Group questions by decision stage so the user can answer without a long form.
- If the mode is unclear and materially affects the work, offer these two choices in one short question while preparing useful, reversible research. Respect a mode chosen earlier in the conversation. The user's specific instructions take precedence over either mode.

## Stack and defaults

- Use Remotion with React/TypeScript, headless Chromium, Node, Python, and FFmpeg/FFprobe.
- Build visuals with React layouts, SVG, and Canvas. Add Three.js, PixiJS, or WebGL only when the concept needs them and a browser smoke render succeeds.
- Prefer Edge TTS `ne-NP-HemkalaNeural` for Nepali narration. Confirm availability through the installed client's voice listing. Choose another voice only when requested or after reporting that Hemkala is unavailable.
- Describe the architecture accurately: editing, orchestration, mixing, and rendering run in the VM; Edge TTS is a client for Microsoft's online speech service and needs network access. It is not an offline local speech model.
- Default social reels to 1080×1920, 30 fps; landscape to 1920×1080, 30 fps. Respect supplied dimensions and duration. Export H.264 video, AAC audio when present, yuv420p, and MP4 fast-start.

## Workflow

### 1. Establish the brief and runtime

Extract brand, goal, audience, language, aspect ratio, duration, supplied assets, key message, and CTA. In YOLO mode, use context and sensible defaults; ask only for facts that block accurate production. In Guided mode, gather preferences in stages using the creative brief, including where each requested photo, video, or screen recording will appear. For greetings, a CTA and narration are optional.

For Byte Encoder, Batuly, or Fabdale, read [brand-context.md](references/brand-context.md). Confirm current prices, offers, product claims, and contact details from supplied or authoritative sources before using them.

Inspect existing project scripts, lockfiles, installed binaries, browser availability, memory, and disk. Preserve compatible pinned dependencies; check installed API definitions and CLI help before using version-sensitive options. Record resolved versions. Store npm cache in a writable task directory when needed, without changing HOME.

Run a short composition smoke render before building the full video. If setup or rendering fails, read [headless-runtime.md](references/headless-runtime.md). Finish this step with a working render path or a precise blocker and preserved editable source.

### 2. Write narration and measure timing

Write a concise script and scene plan. In Guided mode, discuss script options and settle the chosen copy and visual approach with the user before generating the full production. Generate narration before finalizing scene timing. Use scene-level audio files to allow revisions without regenerating the whole track. For Nepali, write natural Devanagari, expand awkward abbreviations and numbers, and audition brand names and key lines when audio playback is available.

Example, after checking the installed CLI:

```bash
edge-tts --voice ne-NP-HemkalaNeural --file narration.txt --write-media narration.mp3
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 narration.mp3
```

Measure each clip, include pauses and transition room, and derive integer frame ranges from actual durations. Fit the script to a fixed runtime by rewriting or reasonable speech-rate adjustment, then regenerate and remeasure. Finish with a scene timing manifest containing audio paths, frame starts, durations, captions, and asset paths. For silent work, build the manifest directly from the visual pacing.

### 3. Build editable scenes

Keep copy, asset paths, colors, and timing in structured data. In Guided mode, show the user a timecoded storyboard and asset list, then apply their choices before building. In YOLO mode, create that storyboard internally and proceed. Use reusable scene components and deterministic animation driven by Remotion frames, including seeded randomness for particles. Resolve assets locally and wait for fonts and media before frame capture.

Bundle a suitable Devanagari font for Nepali text and the specified brand fonts. Use vector icons in place of platform-dependent color emoji. Check text shaping, wrapping, contrast, mobile readability, and platform overlay margins. Use real supplied product images and screenshots where accuracy matters.

Finish with a composition whose visual and audio timings match the manifest and whose assets resolve without interactive browser actions.

### 4. Preview and revise

Render a low-resolution preview, such as 540×960 for a vertical video. Extract frames about every two seconds plus scene boundaries, the first frame, and the final frame. Inspect them with an image viewer; watch or listen to the preview when supported. Fix clipping, missing glyphs, blank assets, awkward transitions, and narration/caption mismatch. In Guided mode, show the preview and invite specific revisions to copy, shot order, pacing, visual treatment, and audio before the final export; if the user has already delegated those choices, proceed.

Use speech recognition only as an optional timing/transcript check; Whisper is STT, not the TTS engine. If audio cannot be auditioned, state that limitation rather than claiming listening QA.

### 5. Mix and export

Mix licensed or original music and SFX below narration, duck music during speech, prevent clipping, and fade cleanly. Normalize for the intended platform and measure the result; avoid claiming an unmeasured loudness target was met. Preserve full final narration and CTA hold time.

Render at the requested resolution and fps, then inspect representative final frames. Use ffprobe to verify dimensions, frame rate, codec, audio presence when expected, and duration. Check for audio/video cutoff and successful playback or decoding. Recheck only problems introduced by the final render.

### 6. Deliver reproducibly

Deliver the final MP4, standalone voiceover when used, and editable source archive. Include the lockfile, local fonts/media with permitted redistribution, timing manifest, render commands, any runtime workaround, and its activation instructions. Exclude node_modules, caches, secrets, and redundant intermediates. Provide runnable preview, frame-extraction, and final-render commands matching the actual project.

Persist outputs using the environment's required artifact storage workflow. Report what was checked and any unresolved limitation. Do not represent a source-only package or an uninspected render as a finished video.
