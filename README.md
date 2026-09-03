# Twilio Voice React Native SDK

> **CurrentClient fork** (`currentclient/twilio-voice-react-native`)
>
> This is CurrentClient's first-party fork of the Twilio Voice React Native
> SDK, tracking upstream `1.7.0`. It replaces the
> `patches/@twilio+voice-react-native-sdk+1.7.0.patch` previously maintained
> in `cc-mob-app` via patch-package. See PRO-3980.
>
> **What differs from upstream**
> - Android: ringer-mode aware `MediaPlayerManager` rewrite, `VoiceService`
>   null-safety hardening, lock-screen window-flag fixes (`fix(android)` commit)
> - iOS: early CallKit reporting via a shared `CXProvider`, native VoIP push
>   handling with deferred PushKit completion, cold-start call-invite race fix
>   (`fix(ios)` commit)
> - Ships an **Expo config plugin** (`app.plugin.js` / `plugin/`): background
>   modes, user-activity types, header search path, Android permissions and
>   service declarations. See `plugin/index.js` for supported props.
>
> **Consuming** (in `package.json`):
> ```json
> "@twilio/voice-react-native-sdk": "github:currentclient/twilio-voice-react-native#<branch-or-tag>"
> ```
> The committed `lib/` build output is used as-is (the upstream `prepare`
> script was renamed to `build:lib` so git installs do not rebuild). If you
> change TypeScript sources, run `yarn build:lib` and commit the result.
>
> **Tracking upstream**: add `https://github.com/twilio/twilio-voice-react-native`
> as the `upstream` remote and cherry-pick or merge release tags selectively.
>
> **Keeping this fork current** (PRO-7321)
>
> - *Drift detection.* `.github/workflows/upstream-drift-check.yml` runs
>   weekly (and on demand via `workflow_dispatch`), compares
>   `.upstream-tracking.json`'s `baseTag` against upstream's latest
>   **stable** tag, and files a GitHub issue labeled `upstream-drift` on
>   the `DRIFT_ISSUE_REPO` sink repo (an Actions repo variable, defaults to
>   this repo) when we're `driftThresholdStableReleases` or more behind.
>   It never opens a duplicate while one is still open. Triage that issue
>   into a PRO ticket if action is warranted. This repo currently has
>   **Issues disabled** and no `DRIFT_ISSUE_REPO` is set, so in practice it
>   falls back to intentionally failing the scheduled run (with the drift
>   details in the job log / step summary) as the signal — either
>   re-enabling Issues here or pointing `DRIFT_ISSUE_REPO` at a repo that
>   has them (plus a token with write access there, if it's not this repo)
>   switches it back to filing real issues, no code change needed.
> - *Patch series.* All 13 CC commits carried on top of `1.7.0` live as an
>   ordered, re-appliable patch series in `patches/1.7.0/` (see
>   `patches/1.7.0/SERIES.md` for what each one does and why). Applying the
>   series with `git am` onto a clean `1.7.0` checkout reproduces this
>   fork's `main` tree exactly — that's what makes a rebase mechanical
>   instead of an archaeology dig.
> - *Rebasing onto a new upstream tag:*
>   1. `scripts/rebase-patches.sh <new-tag>` — fetches the tag, branches
>      `cc-patches/<new-tag>` from it, and `git am`s the current series onto
>      it. Resolve any conflicts the normal `git am` way.
>   2. Run this repo's native builds/lint, then in `cc-mob-app` run the
>      `TwilioRNVoiceDriver` conformance suite and a real-device PSTN voice
>      smoke (`.maestro-real-device/`) against an app built against the
>      rebased branch.
>   3. Re-export the series from the new base
>      (`git format-patch <new-tag>..cc-patches/<new-tag> -o patches/<new-tag> --binary`),
>      update `.upstream-tracking.json`'s `baseTag`, tag the result
>      (`<new-tag>-cc.1`), and push branch + tag.
>   4. In `cc-mob-app`, bump the SHA pin (`package.json` +
>      `package-lock.json`, two spots) to the **post-merge** commit on this
>      fork's `main` — this repo squash-merges every PR, so a branch-head
>      pin goes dangling the moment the branch is deleted (factory lessons
>      L1759/L1760/L1766). Never pin an open PR's branch head.
> - *Upstream 2.0.0.* Not GA yet (latest tag is `2.0.0-rc4`). See
>   [`2.0.0-ADOPTION-PLAN.md`](./2.0.0-ADOPTION-PLAN.md) for the breaking-change
>   assessment, patch-absorption check, and adoption gate — do not rebase
>   onto it ahead of that plan.

[![NPM](https://img.shields.io/npm/v/%40twilio/voice-react-native-sdk.svg?color=blue)](https://www.npmjs.com/package/%40twilio/voice-react-native-sdk) [![CircleCI](https://dl.circleci.com/status-badge/img/gh/twilio/twilio-voice-react-native/tree/main.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/twilio/twilio-voice-react-native/tree/main)

Twilio's Voice React Native SDK allows you to add real-time voice and PSTN calling to your React Native apps.

- [Documentation](https://www.twilio.com/docs/voice/sdks/react-native)
- [API Reference](https://github.com/twilio/twilio-voice-react-native/blob/latest/docs/api/voice-react-native-sdk.md)
- [Reference App](https://github.com/twilio/twilio-voice-react-native-app)

Please check out the following if you are new to Twilio's Programmable Voice or React Native.

- [Programmable Voice](https://www.twilio.com/docs/voice/sdks)
- [React Native](https://reactnative.dev/docs/getting-started)

## Installation
The package is available through [npm](https://www.npmjs.com/package/@twilio/voice-react-native-sdk).

```sh
yarn add @twilio/voice-react-native-sdk
```

Once the package has been installed to your React Native application, there are further steps that you will need to take for both iOS and Android platforms. Please see the supporting documentation below.

## Supporting Documentation

### Getting Started

#### iOS
Learn how to get started for the [iOS platform](/docs/getting-started-ios.md).

#### Android
Learn how to get started for the Android platform if you are using [Java](/docs/getting-started-android-java.md) or [Kotlin](/docs/getting-started-android-kotlin.md).

### Migration Guide
If you are migrating from a version of the Twilio Voice React Native SDK `< 1.0.0.beta.4` to a version `>= 1.0.0.beta.4`, please see [this](/docs/migration-guide-beta.4.md) document.

### Customizing Notifications
To customize the appearance and content of your application's notifications, please see [this](/docs/customize-notifications.md) document.

### Outgoing Call Ringback Tone
To enable your application to play a ringback tone while making an outgoing call, please see [this](/docs/play-outgoing-call-ringback-tone.md) document.

### Out-of-band PushKit Handling
To have your application implement or use its own `PushKit` delegate module, please see [this](/docs/applications-own-pushkit-handler.md) document.

### Out-of-band Firebase Messaging Service
To have your application implement or use a different `FirebaseMessagingService` (such as OneSignal or RNFirebase), please see [this](/docs/out-of-band-firebase-messaging-service.md) document.

## Issues and Support
Please check out our [common issues](/COMMON_ISSUES.md) page or file any issues you find here on Github. For general inquiries related to the Voice SDK you can file a support ticket.

Please ensure that you are not sharing any [Personally Identifiable Information(PII)](https://www.twilio.com/docs/glossary/what-is-personally-identifiable-information-pii) or sensitive account information (API keys, credentials, etc.) when reporting an issue.

Please check out our [known issues](/KNOWN_ISSUES.md) for known bugs and workarounds.

## Related
- [Reference App](https://github.com/twilio/twilio-voice-react-native-app)
- [Twilio Voice JS](https://github.com/twilio/twilio-voice.js)
- [Twilio Voice iOS](https://github.com/twilio/voice-quickstart-ios)
- [Twilio Voice Android](https://github.com/twilio/voice-quickstart-android)

## License
See [LICENSE](/LICENSE)
