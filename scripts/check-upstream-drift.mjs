#!/usr/bin/env node
/**
 * Compares this fork's tracked upstream base (`.upstream-tracking.json`)
 * against the latest *stable* tag of `twilio/twilio-voice-react-native`,
 * and signals when the fork has fallen `driftThresholdStableReleases` or
 * more stable releases behind.
 *
 * Run by .github/workflows/upstream-drift-check.yml on a weekly schedule
 * and on workflow_dispatch.
 *
 * Signal path:
 *   - Preferred: file (or leave alone, if one's already open) a GitHub
 *     issue labeled `upstream-drift`. Requires `gh` on PATH, authenticated
 *     (the workflow exports GH_TOKEN from GITHUB_TOKEN), AND this repo to
 *     have Issues enabled.
 *   - Fallback: if Issues are disabled here, or issue creation fails for
 *     any other reason (permissions, rate limit, etc.), this script never
 *     throws uncaught — it logs the drift report, writes it to
 *     $GITHUB_STEP_SUMMARY when running in Actions, and exits non-zero.
 *     A failing scheduled run is itself a working signal on a repo with
 *     no Issues: GitHub notifies watchers on scheduled-workflow failure
 *     without needing any extra permission.
 *
 * This does not open a Linear ticket directly — the fork repo has no
 * Linear credentials in CI. Whichever signal above fires is the trigger a
 * human turns into a PRO ticket.
 */

import { readFileSync, appendFileSync } from 'node:fs';
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

function authHeaders() {
  return {
    'User-Agent': 'cc-upstream-drift-check',
    Accept: 'application/vnd.github+json',
    ...(process.env.GITHUB_TOKEN
      ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
      : {}),
  };
}

async function fetchAllTags(upstreamRepo) {
  const tags = [];
  let page = 1;
  for (;;) {
    const res = await fetch(
      `https://api.github.com/repos/${upstreamRepo}/tags?per_page=100&page=${page}`,
      { headers: authHeaders() },
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

/** owner/repo of THIS repo (the fork), not the upstream one. */
function currentRepoSlug() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  try {
    const url = execFileSync('git', ['remote', 'get-url', 'origin'], {
      encoding: 'utf8',
      cwd: REPO_ROOT,
    }).trim();
    const m = /github\.com[:/]([^/]+\/[^/.]+?)(\.git)?$/.exec(url);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/**
 * true / false when we could determine it, null when we couldn't tell
 * (network error, no token, etc.) — null means "try the issue path and
 * fall back gracefully if it fails," not "assume enabled."
 */
async function issuesEnabled(repoSlug) {
  if (!repoSlug) return null;
  try {
    const res = await fetch(`https://api.github.com/repos/${repoSlug}`, {
      headers: authHeaders(),
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body.has_issues === true;
  } catch {
    return null;
  }
}

function hasOpenDriftIssue() {
  try {
    const out = execFileSync(
      'gh',
      ['issue', 'list', '--state', 'open', '--label', DRIFT_LABEL, '--json', 'number'],
      { encoding: 'utf8', cwd: REPO_ROOT },
    );
    return JSON.parse(out).length > 0;
  } catch (err) {
    console.error(`could not list existing issues (${err.message}); assuming none open`);
    return false;
  }
}

function driftTitle({ upstreamRepo, baseTag, latest, behindCount }) {
  return `Upstream drift: ${upstreamRepo} is ${behindCount} stable release(s) ahead of our base (${baseTag} -> ${latest.tag})`;
}

function driftBody({ baseTag, latest, behindTags }) {
  return [
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
  ].join('\n');
}

/** Returns true on success, false on any failure — never throws. */
function tryOpenDriftIssue(info) {
  const title = driftTitle(info);
  const body = [
    driftBody(info),
    '',
    '_Filed automatically by `.github/workflows/upstream-drift-check.yml`. Triage into a PRO ticket if action is needed; close this issue (or just let the next scheduled run re-evaluate) once `baseTag` is bumped._',
  ].join('\n');

  try {
    execFileSync(
      'gh',
      ['issue', 'create', '--title', title, '--body', body, '--label', DRIFT_LABEL],
      { stdio: 'inherit', cwd: REPO_ROOT },
    );
    return true;
  } catch (err) {
    console.error(`could not file a GitHub issue (${err.message}).`);
    return false;
  }
}

/** Never throws. Logs, writes a step summary if available, and sets a
 * non-zero exit code so the (scheduled) job itself is the drift signal. */
function reportDriftAsJobFailure(info, reason) {
  const summary = [
    `## Upstream drift detected`,
    '',
    reason,
    '',
    driftBody(info),
  ].join('\n');
  console.error(summary);
  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
    } catch (err) {
      console.error(`could not write $GITHUB_STEP_SUMMARY (${err.message})`);
    }
  }
  process.exitCode = 1;
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

  const driftInfo = {
    upstreamRepo,
    baseTag,
    latest: stable[0],
    behindCount: behind.length,
    behindTags: behind.map((t) => t.tag),
  };

  if (!process.env.GH_TOKEN && !process.env.GITHUB_TOKEN) {
    console.log('no GH_TOKEN/GITHUB_TOKEN in env — skipping signal, report only.');
    return;
  }

  const repoSlug = currentRepoSlug();
  const canFileIssues = await issuesEnabled(repoSlug);

  if (canFileIssues === false) {
    reportDriftAsJobFailure(
      driftInfo,
      `GitHub Issues are disabled on ${repoSlug} — failing this job intentionally as the drift signal.`,
    );
    return;
  }

  if (hasOpenDriftIssue()) {
    console.log(`an open "${DRIFT_LABEL}" issue already exists; not filing a duplicate.`);
    return;
  }

  if (tryOpenDriftIssue(driftInfo)) {
    console.log('opened drift issue.');
    return;
  }

  reportDriftAsJobFailure(
    driftInfo,
    'Could not file a GitHub issue (see the error above) — failing this job as the drift signal instead.',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
