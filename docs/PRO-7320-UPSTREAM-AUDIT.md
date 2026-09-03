# PRO-7320: upstream reconciliation audit (2026-09-03)

Base: our fork branched from upstream `1.7.0` (`b26e782`). `1.7.0` remains the
latest **stable** upstream release; upstream `main` has moved entirely to the
`2.0.0` rewrite (module-proxy architecture, promise rework), currently at
`2.0.0-rc4` and not GA. Full 2.0.0 adoption is tracked separately (PRO-7321).

This audit covers two things: (1) which of the 80 commits between `1.7.0` and
upstream `main` are 1.x-relevant and worth backporting, and (2) a keep/drop
review of the 13 CurrentClient commits carried on top of `1.7.0`.

## 1. Upstream commits audited (1.7.0..upstream/main, 80 commits)

The large majority are not portable without the 2.0 rewrite or aren't
runtime-relevant to us:

- **Expo tooling / test-app infra** (#609, #613, #615, #619, #625, #629,
  #631, #633, #635, #637, #644, #646, #649, #650, #652, #657, #659, #663,
  #664, #667, #675, #676): Expo variant build scripts, the Expo test app, and
  Expo Detox/CI — upstream's own path to Expo support, superseded for us by
  our first-party config plugin (`plugin/`) which already covers this.
- **2.0 module-proxy / promise rewrite** (#626, #627, #628, #638, #639,
  #641, #679, #683, #684, #685, #686, #690, #698, #703, #712, #714, #716,
  #717, and the `CallModuleProxy`/`CallInviteModuleProxy` split): the
  architectural basis for 2.0; nothing here applies to our un-refactored
  1.7.0 codebase without the full rewrite.
- **ICE options feature** (`Voice.connect`/`CallInvite.accept` ICE server
  config: #669/PR "VBLOCK-6096-ice-server-option", #671, #678, #707, plus
  follow-up fixes #b65efa8/#4062d.../#3e1e652/#fc07d3a): a new API surface
  built on the 2.0 module-proxy plumbing (`ModuleProxy.UniversalPromise`
  etc.) that doesn't exist in our 1.7.0 base. Not portable without the
  rewrite; not requested by any current ticket.
- **PreflightTest feature** (#609, #628, #48b78e7): new API surface, 2.0-only
  plumbing.
- **Version/release bookkeeping, CI/publish tooling, docs, changelog, OIDC,
  license header** (all the `2.0.0-dev`/`-rc*`/`-preview.*` tag commits,
  #654, #679, #680, #681, #690, #698, #703, #712, #714): no runtime code.
- **`fix(android): call hold and mute return values` (#640)**: upstream
  changed `promise.resolve(null)` to resolve with the actual hold/mute state.
  **Already the case in our fork** — `TwilioVoiceReactNativeModule.call_hold`
  / `call_mute` already resolve with `getVoiceCall().isOnHold()` /
  `isMuted()`. No action needed.
- **`[VBLOCKS-5823] fix: callinvite sendmessage android` (#651)**: upstream
  added a dedicated `callInvite_sendMessage` native method because their
  post-refactor `CallModuleProxy`/`CallInviteModuleProxy` split no longer
  shared a single dispatch point. **Not applicable** — our un-refactored
  `TwilioVoiceReactNativeModule.call_sendMessage` already branches on
  `CallInviteState.ACTIVE` vs not in one method, so Android call-invite
  messages already route correctly.
- **`[VBLOCKS-6682] feat: ignore accept and reject for invalid callinvites`**
  (#695, reverted by #699, reapplied by the `ci-interim` merge #716 as
  `f450e5e`): fixes an Android NPE crash when a stale notification's
  accept/reject action fires after its `CallRecord` has been evicted (e.g.
  process death). **Backported** (see below) — genuinely 1.x-relevant, low
  risk, does not depend on the 2.0 rewrite.
- **`[VBLOCKS-4141] Add unknown type audio device` (#700)**: fixes an
  Android bug where `AudioSwitchManager` mapped audio device type via
  `getClass().getSimpleName()` — a reflection-based lookup that R8/ProGuard
  can silently break in a minified release build (AudioSwitch ships no
  consumer ProGuard rule protecting its class names), making
  `AudioDevice.type` null for every device once that happens. **Backported
  the R8-safety fix only** (instanceof-based lookup); we did **not** carry
  the accompanying `AudioDevice.Type.Unknown` / `nativeType` API additions
  from that commit, since those are a real (if small) public API change and
  not required to fix the underlying bug.

### Backported in this PR

1. **Android: dismiss orphaned call notifications** (backport of
   `f450e5e` / VBLOCKS-6682, reapplying reverted `#695`/`#699`). Our
   `VoiceService.onStartCommand` already guards `null` UUID/call-record
   (added independently in `d8711b1`, predating this upstream fix) but did
   not dismiss the now-orphaned notification, so a stale accept/reject
   button could linger forever after the call record was evicted. Added
   `Constants.MSG_KEY_NOTIFICATION_ID`, threaded the notification id through
   the reject/accept `PendingIntent`s (`NotificationUtility`), and dismiss it
   via `removeNotification()` in the orphan-guard path. We did not carry the
   `IceOptions`-on-accept portion of that same upstream commit — unrelated
   2.0-only feature, not part of this fix.
2. **Android: R8-safe audio device type mapping** (backport of the fix
   portion of `8a253a5` / VBLOCKS-4141). Replaced the class-name-keyed
   `AUDIO_DEVICE_TYPE` map (`AudioSwitchManager`) with an `instanceof`-based
   `getAudioDeviceType()`, matching upstream's fix rationale, without
   upstream's accompanying `Unknown`/`nativeType` API surface.

## 2. Keep/drop review of the 13 carried CurrentClient commits

None of the 80 upstream commits touch iOS VoIP-push/CallKit lifecycle,
ringback audio, or Android ringer-mode media playback — the areas our 13
commits patch. Verdict: **all still needed**, upstream has not absorbed any
of them.

| Commit | Topic | Verdict |
|---|---|---|
| `d8711b1` | Android: ringer-mode aware `MediaPlayerManager` rewrite + `VoiceService` null-safety hardening (GH-430) | **Keep** — no upstream equivalent; this PR extends its null-safety guard rather than replacing it |
| `5b017a7` | iOS: early CallKit reporting via shared `CXProvider`, cold-start race fix | **Keep** — no upstream equivalent |
| `f4d38f5` | Expo config plugin (first-party) | **Keep for now** — upstream's Expo support (the #609-#676 series) is built on the 2.0 module-proxy rewrite and isn't usable on our 1.7.0 base; reassess when/if 2.0 is adopted (PRO-7321 Part B) |
| `135dab3`, `689b2fb` | iOS: VoIP push completion on cancel/timeout (PRO-4264) | **Keep** — no upstream equivalent |
| `bf5e7f3` | iOS: synchronous VoIP push reporting (PRO-5725) | **Keep** — no upstream equivalent |
| `f2d17ec` | `renovate.json` | **Keep** — tooling, orthogonal to upstream code changes |
| `9974c8b` | iOS: ship ringback asset from pod bundle (PRO-5724) | **Keep** — no upstream equivalent |
| `af8763d` | Generated US PSTN ringback tone | **Keep** — no upstream equivalent |
| `f7f1571` | iOS call-timer locale fix + ringback lifecycle (PRO-5724) | **Keep** — no upstream equivalent |
| `fa7da25` | Android: `BackgroundServiceStartNotAllowedException`/`ForegroundServiceStartNotAllowedException` guards (PRO-6096) | **Keep** — no upstream equivalent |
| `42d9b45` | iOS: guard VoIP push handling against mid-handling exception (PRO-6691) | **Keep** — no upstream equivalent |
| `e4fbffb` | Bump native Twilio Voice Android SDK to 6.13.7 | **Keep** — native SDK dependency currency, independent of the RN-wrapper reconciliation this ticket covers |

No commits were dropped. Shrinking the patch set isn't possible yet because
upstream's only forward motion since `1.7.0` is the 2.0 rewrite, which
doesn't share code with our 1.x base.

## 3. CI coverage of this change

This repo has no `.github/workflows` directory and no CircleCI wired up
(`.circleci/config.yml` exists but has no connected GitHub App — no run of
it appears anywhere in this repo's CI history). The only automated check on
any PR here, including this one, is GitHub's default CodeQL setup
(`Analyze javascript-typescript/python/ruby`), a static scan, not a build or
test run. There is no Android compile, no Java unit test, and no e2e/Detox
run on this or any prior PR to this fork. The two backports in this PR are
Java-only and have **no automated verification** — they were checked by
manual read-through against the actual upstream fix diffs and this fork's
current source, not by a green check. Flagging this as a real gap rather
than implying coverage that doesn't exist; wiring up a real Android build/
test job here is out of scope for this ticket.

## 4. Version

Fork version bumped `1.7.0-cc.1` → `1.7.0-cc.5` in `package.json` (the two
backports above; the field was already stale before this PR — six commits
(`f2d17ec`, `af8763d`, `f7f1571`, `fa7da25`, `42d9b45`, `e4fbffb`) had landed
on `main` since the `1.7.0-cc.4` tag with no version bump, so this catches
those up too). Tag `main` as `1.7.0-cc.5` once this merges.
