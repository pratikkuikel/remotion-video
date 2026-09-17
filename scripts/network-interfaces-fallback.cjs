'use strict';

// Reconstructed opt-in workaround; validate with the project's actual renderer.
if (process.env.REMOTION_LOOPBACK_FALLBACK === '1') {
  const os = require('node:os');
  const {syncBuiltinESMExports} = require('node:module');
  const original = os.networkInterfaces;
  const supportedCodes = new Set(['EACCES', 'EPERM', 'ENOSYS']);
  let warned = false;

  os.networkInterfaces = function (...args) {
    try {
      return Reflect.apply(original, os, args);
    } catch (error) {
      const knownSystemFailure = error && error.code === 'ERR_SYSTEM_ERROR' &&
        error.info && error.info.syscall === 'uv_interface_addresses';
      if (!error || (!supportedCodes.has(error.code) && !knownSystemFailure)) {
        throw error;
      }
      if (!warned) {
        process.stderr.write('[remotion] Interface lookup failed; using loopback metadata.\n');
        warned = true;
      }
      return {
        lo: [{
          address: '127.0.0.1',
          netmask: '255.0.0.0',
          family: 'IPv4',
          mac: '00:00:00:00:00:00',
          internal: true,
          cidr: '127.0.0.1/8',
        }],
      };
    }
  };
  syncBuiltinESMExports();
}
