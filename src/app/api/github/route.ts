import { NextResponse } from 'next/server';

const USERNAME = 'Satwiksai36';
const GH_TOKEN  = process.env.GITHUB_TOKEN;
const GH_HEADERS: Record<string, string> = {
  'User-Agent': 'portfolio-engine',
  Accept: 'application/vnd.github+json',
  ...(GH_TOKEN ? { Authorization: `Bearer ${GH_TOKEN}` } : {}),
};

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function labelEvent(type: string): string {
  switch (type) {
    case 'PushEvent':        return 'pushed to';
    case 'CreateEvent':      return 'created';
    case 'PullRequestEvent': return 'opened PR on';
    case 'ForkEvent':        return 'forked';
    case 'WatchEvent':       return 'starred';
    case 'IssuesEvent':      return 'opened issue on';
    default:                 return 'activity on';
  }
}

export async function GET() {
  try {
    const [profileRes, eventsRes, contribRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}`,
        { headers: GH_HEADERS, next: { revalidate: 3600 } }),
      fetch(`https://api.github.com/users/${USERNAME}/events?per_page=30`,
        { headers: GH_HEADERS, next: { revalidate: 3600 } }),
      fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}?y=last`,
        { next: { revalidate: 3600 } }),
    ]);

    const profile  = await profileRes.json();
    const events   = await eventsRes.json();
    const contribs = await contribRes.json();

    // Deduplicate consecutive pushes to the same repo
    const seen = new Set<string>();
    const filtered = (Array.isArray(events) ? events : [])
      .filter((e: { type: string; repo: { name: string }; created_at: string }) => {
        const key = `${e.type}-${e.repo.name}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 5)
      .map((e: { type: string; repo: { name: string }; created_at: string }) => ({
        action:  labelEvent(e.type),
        repo:    e.repo.name.replace(`${USERNAME}/`, ''),
        time:    timeAgo(e.created_at),
      }));

    return NextResponse.json({
      login:         profile.login        ?? USERNAME,
      repos:         profile.public_repos ?? 0,
      followers:     profile.followers    ?? 0,
      lastActive:    filtered[0]?.time    ?? 'recently',
      totalLastYear: contribs?.total?.lastYear ?? 0,
      contributions: contribs?.contributions  ?? [],
      events:        filtered,
    });
  } catch {
    return NextResponse.json({ error: true }, { status: 500 });
  }
}
