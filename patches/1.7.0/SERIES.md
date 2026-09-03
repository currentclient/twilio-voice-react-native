# CC patch series — base `1.7.0`

This directory is an **ordered, mechanically-applicable export** of every
CurrentClient commit carried on top of upstream tag `1.7.0`, generated with:

```
git format-patch b26e782..e4fbffb -o patches/1.7.0 --binary
```

(`b26e782` is upstream tag `1.7.0`; `e4fbffb` was fork `main` HEAD when this
series was cut.) Applying the series onto a clean checkout of `1.7.0` with
`git am patches/1.7.0/*.patch` reproduces the exact tree CurrentClient ships
today — verified by comparing the resulting tree SHA against fork `main`.

Do not hand-edit these files. Regenerate the whole directory instead (see
`scripts/rebase-patches.sh`, or run `git format-patch` yourself) so the
patches always match a real, buildable commit range.

## Series contents

| # | Commit (fork `main`) | Ticket | Summary | Still needed after upstream `2.0.0`? |
|---|---|---|---|---|
| 0001 | `d8711b1` | — | Android: ringer-mode aware `MediaPlayerManager` rewrite, `VoiceService` null-safety hardening | TBD at 2.0.0 assessment |
| 0002 | `5b017a7` | — | iOS: early CallKit reporting via a shared `CXProvider`, cold-start call-invite race fix | TBD |
| 0003 | `f4d38f5` | PRO-3980 | Ship a first-party Expo config plugin (`app.plugin.js` / `plugin/`) | TBD — plugin surface is CC-specific, likely always carried |
| 0004 | `135dab3`\* | PRO-4264 | iOS: satisfy VoIP push completion on cancel/timeout to prevent a crash | TBD |
| 0005 | `bf5e7f3` | PRO-5725 | iOS: report VoIP pushes synchronously instead of on a timer | TBD |
| 0006 | `9974c8b` | PRO-5724 | iOS: ship the ringback asset and load it from the pod bundle | TBD |
| 0007 | `f2d17ec` | — | `chore(deps)`: add `renovate.json` | N/A — fork tooling, not upstream behavior |
| 0008 | `af8763d` | — | Replace the ringback asset with a generated US PSTN tone | TBD |
| 0009 | `f7f1571` | PRO-5724 | iOS: fix call-timer locale bug + land ringback lifecycle fixes | TBD |
| 0010 | `fa7da25` | PRO-6096 | Android crash report fix (1.58.0) | TBD |
| 0011 | `42d9b45` | PRO-6691 | iOS: guard VoIP push handling against a mid-handling exception | TBD |
| 0012 | `e4fbffb` | PRO-7306 | Bump vendored native Twilio Voice SDK to 6.13.7 (VoIP push crash fixes) | Superseded by whatever native SDK version 2.0.0 vendors — re-check, don't just re-apply |

\* Upstream history actually carries **two** commits with this exact title
(`689b2fb` and `135dab3`) — one lands on each side of the `#1` expo-plugin
merge and one is a no-op once linearized (`git format-patch` emits it as an
empty patch, so it's dropped here). The fix itself is real and is fully
captured by patch 0004; this is why the series has 12 files for "13 CC
commits."

## Regenerating this series after a rebase

See the "Keeping this fork current" section of the top-level `README.md`
and `scripts/rebase-patches.sh`. Short version: rebase (or `git am` this
series) onto the new upstream tag, fix any conflicts, then
`git format-patch <new-tag>..<your-branch> -o patches/<new-tag> --binary`
and update `.upstream-tracking.json`'s `baseTag`.
