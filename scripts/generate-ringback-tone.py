#!/usr/bin/env python3
"""Generate the outgoing-call ringback tone shipped to iOS and Android.

US standard PSTN ringback (Precise Tone Plan): 440 Hz + 480 Hz summed,
2 s on / 4 s off. We emit exactly one 6 s cadence; both players loop the
file, so the loop point reproduces the cadence indefinitely.

The loop is seamless by construction: 2.000 s is 880 whole cycles of 440 Hz
and 960 whole cycles of 480 Hz, so the tone begins and ends at zero phase and
is followed by silence.

stdlib only (wave + math) -- no dependency, no downloaded asset, no license
question. Run with --verify to re-read what was written and assert it.

    python3 scripts/generate-ringback-tone.py            # write both assets
    python3 scripts/generate-ringback-tone.py --verify   # write, then check
"""

import math
import os
import struct
import sys
import wave

RATE = 16000  # mono 16 kHz 16-bit PCM -- a phone tone, not music
FREQS = (440.0, 480.0)
ON_SEC = 2.0
OFF_SEC = 4.0
RAMP_SEC = 0.010  # de-click the switch edges; PSTN switches hard, speakers don't
AMPLITUDE = 0.25  # per tone; the two sum to 0.5 FS peak (-6 dBFS), no clipping

TARGETS = (
    "ios/Resources/ringtone.wav",
    "android/src/main/res/raw/ringtone.wav",
)


def samples():
    on, ramp = int(ON_SEC * RATE), int(RAMP_SEC * RATE)
    for i in range(on):
        v = sum(math.sin(2 * math.pi * f * i / RATE) for f in FREQS) * AMPLITUDE
        if i < ramp:
            v *= 0.5 - 0.5 * math.cos(math.pi * i / ramp)
        elif i >= on - ramp:
            v *= 0.5 - 0.5 * math.cos(math.pi * (on - i) / ramp)
        yield int(round(v * 32767))
    for _ in range(int(OFF_SEC * RATE)):
        yield 0


def write(path):
    frames = struct.pack("<%dh" % (int((ON_SEC + OFF_SEC) * RATE)), *samples())
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(frames)
    print("wrote %s (%d bytes)" % (path, os.path.getsize(path)))


def goertzel(sig, freq):
    """Magnitude of `freq` in `sig`, normalized to samples."""
    re = sum(v * math.cos(2 * math.pi * freq * i / RATE) for i, v in enumerate(sig))
    im = sum(v * math.sin(2 * math.pi * freq * i / RATE) for i, v in enumerate(sig))
    return math.hypot(re, im) / len(sig)


def rms(sig):
    return math.sqrt(sum(v * v for v in sig) / len(sig))


def verify(path):
    with wave.open(path, "rb") as w:
        assert w.getnchannels() == 1, "must be mono"
        assert w.getsampwidth() == 2, "must be 16-bit"
        assert w.getframerate() == RATE, "unexpected sample rate"
        n = w.getnframes()
        assert n == int((ON_SEC + OFF_SEC) * RATE), "unexpected duration"
        sig = struct.unpack("<%dh" % n, w.readframes(n))

    on = sig[int(0.2 * RATE):int(ON_SEC * RATE) - int(0.2 * RATE)]
    off = sig[int(ON_SEC * RATE) + 1:]
    assert rms(on) > 3000, "tone segment is too quiet: %.0f" % rms(on)
    assert max(abs(v) for v in off) == 0, "silent segment is not silent"
    assert max(abs(v) for v in sig) < 32767, "clipping"

    seg = on[: RATE // 2]
    for f in FREQS:
        assert goertzel(seg, f) > 2000, "%g Hz missing (%.0f)" % (f, goertzel(seg, f))
    for f in (400.0, 1000.0):  # nothing else should be in there
        assert goertzel(seg, f) < 200, "unexpected energy at %g Hz" % f
    print("verified %s: 440+480 Hz, %gs on / %gs off, mono %d Hz" % (path, ON_SEC, OFF_SEC, RATE))


if __name__ == "__main__":
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    paths = [os.path.join(root, t) for t in TARGETS]
    for p in paths:
        write(p)
    if "--verify" in sys.argv:
        for p in paths:
            verify(p)
