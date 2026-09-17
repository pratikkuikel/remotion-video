# Headless VM rendering

## Historical issue and patch provenance

Earlier Batuly/Fabdale workflow notes recorded a sandbox OS error from Node `os.networkInterfaces()` during Remotion local server/preview-port setup. A narrow loopback fallback enabled rendering. The exact original patch and file location were not recovered when this skill was created.

The bundled `scripts/network-interfaces-fallback.cjs` is a reconstructed, opt-in implementation of that workaround. It was verified by a real headless render on 2026-09-17 with Node 24.19.0 and Remotion 4.0.525; validate separately on other versions. Never describe it as the recovered original patch or as universally required for headless rendering.

In that run, an unpatched `render` bundled the composition but failed in `@remotion/renderer/dist/port-config.js` during `serveStatic`: `SystemError [ERR_SYSTEM_ERROR]: uv_interface_addresses returned Unknown system error 1`. Preloading the shim printed `[remotion] Interface lookup failed; using loopback metadata.` and rendered the 11-frame smoke test, the 660-frame preview, and the final video. The tested invocation from the video project was:

```bash
REMOTION_LOOPBACK_FALLBACK=1 node \
  --require ./scripts/network-interfaces-fallback.cjs \
  ./node_modules/@remotion/cli/remotion-cli.js \
  render src/index.ts BatulyFlow out/smoke.mp4 \
  --browser-executable=.browser/chrome-headless-shell-linux64/chrome-headless-shell \
  --frames=0-10 --scale=0.25 --concurrency=1
```

## Diagnosis and recovery

1. Read the first actionable error. Check browser executable/dependencies, package versions, writable cache, available memory, and local assets.
2. For an error specifically involving `os.networkInterfaces()` or `uv_interface_addresses`, reproduce with `node -e 'console.log(require("node:os").networkInterfaces())'`.
3. If the lookup throws an OS/system error, copy the bundled shim into the video project's scripts directory. Enable it for the failing Node process only:

   ```bash
   REMOTION_LOOPBACK_FALLBACK=1 node --require ./scripts/network-interfaces-fallback.cjs ./node_modules/@remotion/cli/remotion-cli.js render --help
   ```

   The CLI path above is illustrative: resolve the actual installed package's executable from package.json before running it. Apply the same preload to the actual render entry point. If children need it, pass a scoped NODE_OPTIONS preload while preserving existing options; ensure paths containing spaces are quoted correctly.

4. Bind the local render server to loopback using the installed version's supported configuration when possible. The shim supplies interface discovery metadata only; it does not itself change the server binding or bypass network restrictions.
5. Rerun the same smoke render. Capture the original error, command, installed versions, and result alongside the project. If a different error remains, diagnose it separately.

The shim preserves successful calls, activates only with the explicit environment flag, and rethrows errors outside the known OS error cases. It does not edit node_modules or require a desktop GUI.

## Other observed runtime issues

- **Read-only package cache:** Point the package manager's cache to a writable task directory. Preserve HOME and unrelated configuration.
- **Missing fonts or emoji:** Bundle local Devanagari and brand fonts; wait for them to load. Substitute SVG icons for unsupported emoji.
- **Edge TTS certificate errors:** Edge TTS 7.2.8 uses its own `certifi` contexts for voice listing and speech. In this VM, even `SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt` did not override those contexts; `ClientConnectorCertificateError` persisted. The bundled `scripts/edge-tts-system-ca.py` adds the OS CA bundle to both contexts while preserving certificate verification. Run it with the project's Python interpreter and normal Edge TTS CLI arguments. The video test verified `--list-voices` returned `ne-NP-HemkalaNeural` and generated four MP3 clips. Use the default `/etc/ssl/certs/ca-certificates.crt` or set `SYSTEM_CA_BUNDLE` to another trusted bundle. This relies on private Edge TTS module symbols and must be retested on upgrades.
- **Browser download proxy timeouts:** On this VM, `npx remotion browser ensure` timed out establishing a proxy tunnel, although a curl download through the same environment succeeded. Download a version-compatible Chrome Headless Shell with curl into a project-local directory, unzip it, and pass its executable through `--browser-executable`. Confirm source, version, architecture, and checksum where available; do not confuse this network problem with the interface-lookup error.
- **TTS network failure:** Preserve text and completed clips; report the service/network blocker. Render a clearly labeled silent preview if useful, while retaining the narrated deliverable as incomplete.
- **GPU errors:** Prefer the established SVG/Canvas path. Diagnose software rendering options against the installed Chromium/Remotion version only when GPU scenes are necessary. Historical OpenCut WebGPU failures were a separate issue and do not justify adding GPU flags to every Remotion command.
- **Resource exhaustion:** Reduce render concurrency and preview resolution based on available memory, then retry the failed stage.

If Remotion remains unavailable and a simpler FFmpeg composition can meet the brief, clearly identify that fallback and any visual differences. Keep the editable project; do not claim the final MP4 was rendered by Remotion if it was not.
