#!/usr/bin/env node
/**
 * Compares this fork's tracked upstream base (`.upstream-tracking.json`)
 * against the latest *stable* tag of `twilio/twilio-voice-react-native`,
 * and opens (or leaves alone) a GitHub issue when the fork has fallen
 * `driftThresholdStableReleases` or more stable releases behind.
 *
 * Run by .github/workflows/upstream-drift-check.yml on a weekly schedule
 * and on workflow_dispatch. Requires `gh` on PATH and authenticated
 * (the workflow exports GH_TOKEN from the default GITHUB_TOKEN) to file
 * the issue; without that it just prints the report and exits 0.
 *
 * This does not open a Linear ticket directly — the fork repo has no
 * Linear credentials in CI. The GitHub issue is the trigger a human (or
 * the Linear/GitHub sync) turns into a PRO ticket, same as any other
 * repo issue here.
 */

import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const DRIFT_LABEL = 'upstream-drift';

function loadTracking() {
  const raw = readFileSync(path.join(REPO_ROOT, '.upstream-tracking.json'), 'utf8');
  return JSON.parse(raw);
}

function parseSemver(tag) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(tag);
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]), tag };
}

function compareSemver(a, b) {
  return a.major - b.major || a.minor - b.minor || a.patch - b.patch;
}

async function fetchAllTags(upstreamRepo) {
  const tags = [];
  let page = 1;
  for (;;) {
    const res = await fetch(
      `https://api.github.com/repos/${upstreamRepo}/tags?per_page=100&page=${page}`,
      {
        headers: {
          'User-Agent': 'cc-upstream-drift-check',
          Accept: 'application/vnd.github+json',
          ...(process.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
      },
    );
    if (!res.ok) {
      throw new Error(`GitHub tags API ${res.status} for ${upstreamRepo}: ${await res.text()}`);
    }
    const body = await res.json();
    tags.push(...body);
    if (body.length < 100) break;
    page += 1;
  }
  return tags;
}

function hasOpenDriftIssue() {
  try {
    const out = execFileSync(
      'gh',
      ['issue', 'list', '--state', 'open', '--label', DRIFT_LABEL, '--json', 'number'],
      { encoding: 'utf8' },
    );
    return JSON.parse(out).length > 0;
  } catch (err) {
    console.error(`could not list existing issues (${err.message}); assuming none open`);
    return false;
  }
}

function openDriftIssue({ upstreamRepo, baseTag, latest, behindCount, behindTags }) {
  const title = `Upstream drift: ${upstreamRepo} is ${behindCount} stable release(s) ahead of our base (${baseTag} -> ${latest.tag})`;
  const body = [
    `Our fork's tracked base is \`${baseTag}\`. Upstream's latest **stable** release is \`${latest.tag}\`.`,
    '',
    `Stable releases we are behind on (newest first): ${behindTags.map((t) => `\`${t}\``).join(', ')}`,
    '',
    '## Next steps',
    '',
    '1. Read the changelog for the release(s) above and decide whether any',
    '   of it is worth pulling in now vs. waiting for the next planned rebase.',
    '2. If a rebase is warranted, follow "Keeping this fork current" in',
    '   README.md and `scripts/rebase-patches.sh`.',
    '3. After rebasing, update `.upstream-tracking.json`\'s `baseTag` — that',
    '   closes this class of drift until upstream moves again.',
    '',
    '_Filed automatically by `.github/workflows/upstream-drift-check.yml`. Triage into a PRO ticket if action is needed; close this issue (or just let the next scheduled run re-evaluate) once `baseTag` is bumped._',
  ].join('\n');

  execFileSync(
    'gh',
    ['issue', 'create', '--title', title, '--body', body, '--label', DRIFT_LABEL],
    { stdio: 'inherit' },
  );
}

async function main() {
  const tracking = loadTracking();
  const { upstreamRepo, baseTag, driftThresholdStableReleases = 1, prereleaseTagPattern } =
    tracking;
  const prereleaseRe = new RegExp(prereleaseTagPattern ?? '-(rc|preview|alpha|beta|dev)', 'i');

  const base = parseSemver(baseTag);
  if (!base) throw new Error(`baseTag "${baseTag}" in .upstream-tracking.json is not semver`);

  const tags = await fetchAllTags(upstreamRepo);
  const stable = tags
    .map((t) => t.name)
    .filter((name) => !prereleaseRe.test(name) && name !== 'latest')
    .map(parseSemver)
    .filter(Boolean)
    .sort((a, b) => compareSemver(b, a)); // newest first

  const behind = stable.filter((t) => compareSemver(t, base) > 0);

  console.log(`upstream: ${upstreamRepo}`);
  console.log(`fork base: ${baseTag}`);
  console.log(`latest stable upstream: ${stable[0] ? stable[0].tag : '(none found)'}`);
  console.log(`stable releases ahead of base: ${behind.length} (${behind.map((t) => t.tag).join(', ') || 'none'})`);

  if (behind.length < driftThresholdStableReleases) {
    console.log(`within threshold (${driftThresholdStableReleases}); nothing to do.`);
    return;
  }

  if (!process.env.GH_TOKEN && !process.env.GITHUB_TOKEN) {
    console.log('no GH_TOKEN/GITHUB_TOKEN in env — skipping issue creation (report only).');
    return;
  }

  if (hasOpenDriftIssue()) {
    console.log(`an open "${DRIFT_LABEL}" issue already exists; not filing a duplicate.`);
    return;
  }

  openDriftIssue({
    upstreamRepo,
    baseTag,
    latest: stable[0],
    behindCount: behind.length,
    behindTags: behind.map((t) => t.tag),
  });
  console.log('opened drift issue.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
