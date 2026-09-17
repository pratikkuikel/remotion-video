# Headless VM rendering

## Historical issue and patch provenance

Earlier Batuly/Fabdale workflow notes recorded a sandbox OS error from Node `os.networkInterfaces()` during Remotion local server/preview-port setup. A narrow loopback fallback enabled rendering. The exact original patch and file location were not recovered when this skill was created.

The bundled `scripts/network-interfaces-fallback.cjs` is a reconstructed, opt-in implementation of that workaround. Its isolated behavior is tested; compatibility with the current Remotion version must be established by a real smoke render. Never describe it as the recovered original patch or as universally required for headless rendering.

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
- **Edge TTS certificate errors:** Verify the system CA store and configure the installed Python/client to use trusted system certificates if its bundled store fails. Keep TLS verification enabled.
- **TTS network failure:** Preserve text and completed clips; report the service/network blocker. Render a clearly labeled silent preview if useful, while retaining the narrated deliverable as incomplete.
- **GPU errors:** Prefer the established SVG/Canvas path. Diagnose software rendering options against the installed Chromium/Remotion version only when GPU scenes are necessary. Historical OpenCut WebGPU failures were a separate issue and do not justify adding GPU flags to every Remotion command.
- **Resource exhaustion:** Reduce render concurrency and preview resolution based on available memory, then retry the failed stage.

If Remotion remains unavailable and a simpler FFmpeg composition can meet the brief, clearly identify that fallback and any visual differences. Keep the editable project; do not claim the final MP4 was rendered by Remotion if it was not.
