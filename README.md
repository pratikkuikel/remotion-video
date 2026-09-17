# Remotion Video

An AI-agent skill for making promotional videos, product explainers, reels, and animated greetings with **Remotion + React/TypeScript, Edge TTS, and FFmpeg** in a headless Linux VM or on a developer machine.

The repository contains the production workflow, brand references, and a scoped headless workaround. It is a skill package; create a separate Remotion project for each video. No finished video, composition template, or application dependency lockfile is included here.

## Contents

| Path | Purpose |
| --- | --- |
| `SKILL.md` | Instructions for the agent, from brief through verified export |
| `agents/openai.yaml` | Agent-facing skill metadata |
| `references/brand-context.md` | Batuly, Byte Encoder, and Fabdale defaults |
| `references/headless-runtime.md` | Rendering troubleshooting and patch provenance |
| `scripts/network-interfaces-fallback.cjs` | Opt-in fallback for a specific Node OS error |

## Use the skill

Clone this repository:

```bash
git clone https://github.com/pratikkuikel/remotion-video.git
cd remotion-video
```

Give your agent the absolute path to `SKILL.md`, for example:

> Read /absolute/path/to/remotion-video/SKILL.md and use it to create a 30-second vertical Nepali promo for Batuly. Use Hemkala, the attached web screenshots, and the supplied script. Deliver the MP4, voiceover, and editable source.

An agent that supports installing skill folders can install this repository using its own skill installer. Keep `SKILL.md`, `references`, `scripts`, `agents`, and `assets` together so relative paths continue to work.

## Runtime setup

Install Git, a currently supported Node.js LTS with npm, Python 3 with virtual-environment support, and FFmpeg (including FFprobe). A Linux desktop session is not required. Browser binaries must support the machine's architecture; ARM hosts may need a compatible browser supplied explicitly to Remotion.

On Debian/Ubuntu, install the base system tools:

```bash
sudo apt-get update
sudo apt-get install -y git python3 python3-venv ffmpeg ca-certificates fonts-noto-core
```

Install Node.js LTS using your preferred Node version manager or the official installer. Distribution Node packages can lag behind the version needed by your chosen Remotion release.

On macOS with Homebrew:

```bash
brew install git node python ffmpeg
```

Verify:

```bash
node --version
npm --version
python3 --version
ffmpeg -version
ffprobe -version
```

### 1. Create a video project

From the parent directory of this skill checkout, scaffold a separate project:

```bash
npm init video@latest
```

Choose a project name such as `my-video` and a suitable template. Enter that project, install its dependencies if the scaffold did not do so, and prepare the browser:

```bash
cd my-video
npm install
npx remotion browser ensure
```

Commit the generated lockfile. On subsequent setups, use `npm ci`. Keep all Remotion packages on compatible versions. Linux may also need browser shared libraries; follow Remotion's platform instructions for the actual OS and browser instead of applying an arbitrary dependency list.

A completed composition must exist before rendering. This skill guides the agent to create it; scaffolding alone does not create your promotional video.

### 2. Set up Hemkala narration

Inside the video project:

```bash
python3 -m venv .venv
. .venv/bin/activate
python -m pip install edge-tts
edge-tts --list-voices
mkdir -p public/audio
```

Confirm `ne-NP-HemkalaNeural` appears in the voice list. Put the Nepali narration in a UTF-8 file named `narration.txt`, then run:

```bash
edge-tts --voice ne-NP-HemkalaNeural --file narration.txt --write-media public/audio/narration.mp3
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 public/audio/narration.mp3
python -m pip freeze > requirements.txt
```

For later installs, recreate the virtual environment and use `python -m pip install -r requirements.txt`.

**Edge TTS requires internet access to Microsoft's online speech service.** Its client runs locally; speech synthesis is not offline. Rendering, editing, and audio mixing run on your machine. If access is blocked, supply an existing voiceover or resolve connectivity before finishing a narrated video.

Generate separate clips for individual scenes, measure their durations, and build scene timings around them. Include a local Devanagari font and the brand fonts in the video project, with their applicable font licenses.

### 3. Preview and render

From the video project, list compositions using its actual entry file:

```bash
npx remotion compositions src/index.ts
```

The examples below assume entry file `src/index.ts` and composition ID `Promo`. Replace both with values from your project. Set the composition to the intended dimensions and 30 fps before rendering.

```bash
mkdir -p out
npx remotion render src/index.ts Promo out/preview.mp4 --scale=0.5 --codec=h264
npx remotion render src/index.ts Promo out/final.mp4 --codec=h264 --audio-codec=aac --pixel-format=yuv420p
```

Add the narration to the composition before rendering; an audio codec flag does not add a voiceover. Inspect the preview, correct timing and layout, then render the final output. Set MP4 fast-start explicitly in a delivery copy:

```bash
ffmpeg -i out/final.mp4 -c copy -movflags +faststart out/delivery.mp4
```

## Headless network-interface workaround

Use this only when Node's `os.networkInterfaces()` fails with a supported OS error, such as `ERR_SYSTEM_ERROR` whose `info.syscall` is `uv_interface_addresses`. Headless execution alone does not require the patch.

Reproduce the lookup first:

```bash
node -e 'console.log(require("node:os").networkInterfaces())'
```

Copy `scripts/network-interfaces-fallback.cjs` from the skill checkout into the video project's `scripts` directory. From the video project, run the installed CLI through Node:

```bash
REMOTION_LOOPBACK_FALLBACK=1 node \
  --require ./scripts/network-interfaces-fallback.cjs \
  ./node_modules/.bin/remotion \
  render src/index.ts Promo out/smoke.mp4 --frames=0-29 --scale=0.5
```

This command assumes the npm-generated executable is a Node script or symlink, as on typical Linux/macOS installs. Inspect the installed CLI entry point if your package manager uses a different launcher. Once the smoke render succeeds, use the same scoped preload for the full render.

The fallback preserves successful interface lookups, substitutes loopback metadata for supported failures, and rethrows unrelated errors. It does not restore internet access, change server binding, or disable TLS checks. Use supported loopback server configuration when available.

**Provenance:** this is a reconstructed implementation of a previously used workaround. Its isolated branches were tested; it is not the recovered original patch, and compatibility must be checked with each target renderer. See [headless runtime notes](references/headless-runtime.md) for cache, certificate, font, GPU, and memory troubleshooting.

## Production checklist

1. Confirm the brief, real product claims, assets, language, format, and CTA.
2. Generate narration and measure each clip before locking scene timing.
3. Build deterministic Remotion scenes and preload local media/fonts.
4. Inspect a low-resolution preview, scene boundaries, and Nepali text shaping.
5. Mix music and SFX under the voice; check clipping and narration cutoff.
6. Verify the final file and preserve the editable source, assets, timings, dependencies, and render commands.

Useful final checks:

```bash
ffprobe -v error -show_streams -show_format -of json out/delivery.mp4
ffmpeg -v error -i out/delivery.mp4 -f null -
mkdir -p out/frames
ffmpeg -i out/delivery.mp4 -vf fps=1/2 out/frames/frame-%03d.png
```

Inspect the extracted frames and listen to the audio. Passing decoding checks does not establish visual quality. Deliver H.264/AAC MP4, the standalone voiceover when used, and editable source without dependencies, caches, or secrets.

## Upstream documentation

- [Remotion project creation](https://www.remotion.dev/docs/cli/create-video)
- [Remotion browser setup](https://www.remotion.dev/docs/cli/browser)
- [Remotion render CLI](https://www.remotion.dev/docs/cli/render)
- [Edge TTS installation and usage](https://github.com/rany2/edge-tts)
- [Node.js downloads](https://nodejs.org/en/download)
- [FFmpeg documentation](https://ffmpeg.org/documentation.html)
