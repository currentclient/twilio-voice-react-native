#!/usr/bin/env bash
# Mechanically re-apply CurrentClient's carried patch series onto a new
# upstream release tag. See README.md "Keeping this fork current" (PRO-7321).
#
# Usage:
#   scripts/rebase-patches.sh <new-upstream-tag> [<patch-series-dir>]
#
# Example:
#   scripts/rebase-patches.sh 2.0.0 patches/1.7.0
#
# What it does:
#   1. Adds the `upstream` remote if it isn't configured yet and fetches
#      the requested tag.
#   2. Creates branch `cc-patches/<new-upstream-tag>` starting at that tag.
#   3. Applies every patch in the series directory, in order, with `git am`.
#   4. On a clean apply, prints the remaining manual steps.
#   5. On a conflict, `git am` stops with the tree in the normal am/rebase
#      conflict state — resolve it, `git am --continue`, and re-run this
#      script (it's safe to re-run: it starts a fresh branch from the tag
#      each time, so a partially-fixed conflict lives on in your branch's
#      history until you finish the whole series and re-export it).
#
# This script does not push, tag, or touch cc-mob-app — those stay manual
# so a human signs off on the result of each rebase before it goes anywhere.

set -euo pipefail

NEW_TAG="${1:?usage: scripts/rebase-patches.sh <new-upstream-tag> [<patch-series-dir>]}"
DEFAULT_SERIES_DIR=$(ls -d patches/*/ 2>/dev/null | sort -V | tail -1 || true)
SERIES_DIR="${2:-$DEFAULT_SERIES_DIR}"
SERIES_DIR="${SERIES_DIR%/}"

if [ -z "$SERIES_DIR" ] || [ ! -d "$SERIES_DIR" ]; then
  echo "error: no patch series directory found (looked for patches/*/, got '${SERIES_DIR}')" >&2
  exit 1
fi

shopt -s nullglob
PATCHES=("${SERIES_DIR}"/*.patch)
if [ ${#PATCHES[@]} -eq 0 ]; then
  echo "error: no .patch files found in ${SERIES_DIR}" >&2
  exit 1
fi

# Stage the patches outside the working tree BEFORE checking out the
# target tag. patches/ only exists on the fork's own branches — an
# upstream tag's tree never had it — so `git checkout` onto the tag
# below deletes it from disk along with everything else that isn't in
# that tree. Applying from these staged copies keeps the series available
# regardless of what the checkout does to the working tree.
STAGING_DIR=$(mktemp -d)
trap 'rm -rf "$STAGING_DIR"' EXIT
cp "${PATCHES[@]}" "$STAGING_DIR"/
STAGED_PATCHES=("$STAGING_DIR"/*.patch)

if ! git remote get-url upstream >/dev/null 2>&1; then
  echo "adding upstream remote (twilio/twilio-voice-react-native)"
  git remote add upstream https://github.com/twilio/twilio-voice-react-native.git
fi

echo "fetching upstream tag ${NEW_TAG}"
git fetch upstream "refs/tags/${NEW_TAG}:refs/tags/${NEW_TAG}"

BRANCH="cc-patches/${NEW_TAG}"
if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  echo "error: branch ${BRANCH} already exists — delete it or pick it up manually" >&2
  exit 1
fi

echo "creating ${BRANCH} from tag ${NEW_TAG}"
git checkout -b "${BRANCH}" "tags/${NEW_TAG}"

echo "applying ${#STAGED_PATCHES[@]} patches from ${SERIES_DIR}"
git am --3way "${STAGED_PATCHES[@]}"

cat <<EOF

Applied ${#STAGED_PATCHES[@]} patch(es) from ${SERIES_DIR} onto ${NEW_TAG} on branch ${BRANCH}.

Remaining steps (see README.md "Keeping this fork current"):
  1. Build + run the native conformance/lint checks for this repo, then
     the cc-mob-app TwilioRNVoiceDriver conformance suite and a real
     PSTN voice smoke (.maestro-real-device/) against an app pinned to
     this branch.
  2. Re-export the series so the NEXT rebase starts from here:
       git format-patch ${NEW_TAG}..${BRANCH} -o patches/${NEW_TAG} --binary
     and delete the old patches/<old-base>/ directory once the new one
     is verified.
  3. Update .upstream-tracking.json: set "baseTag" and "patchSeriesDir"
     to ${NEW_TAG} / patches/${NEW_TAG}.
  4. Tag the result (e.g. ${NEW_TAG}-cc.1) and push branch + tag.
  5. In cc-mob-app, bump the SHA pin (package.json + package-lock.json,
     two spots) to the post-merge commit on this fork's main — never an
     open branch head (factory lesson L1766/L1759/L1760).
EOF
