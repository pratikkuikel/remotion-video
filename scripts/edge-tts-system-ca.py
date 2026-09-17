"""Run edge-tts with trusted OS CAs added to its certifi TLS contexts.

Pass normal Edge TTS CLI arguments, e.g. --list-voices or --voice ... --file ...
This relies on Edge TTS private symbols; check after upgrades.
"""

import os

import edge_tts.communicate
import edge_tts.voices
from edge_tts.util import main


bundle = os.environ.get("SYSTEM_CA_BUNDLE", "/etc/ssl/certs/ca-certificates.crt")
for context in (edge_tts.communicate._SSL_CTX, edge_tts.voices._SSL_CTX):
    context.load_verify_locations(cafile=bundle)

main()
