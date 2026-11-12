// Matchers for check-private.mjs. Each takes one line and returns true when
// the line looks private. They never return or print the matched text.

const DOC_NETS = [
  [192, 0, 2],
  [198, 51, 100],
  [203, 0, 113],
];

export function hasBadIPv4(line) {
  for (const m of line.matchAll(/(?<![\d.])(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?![\d]|\.\d)/g)) {
    const o = m.slice(1, 5).map(Number);
    if (o.some((n) => n > 255)) continue; // not an address
    const s = o.join('.');
    if (s === '127.0.0.1' || s === '0.0.0.0') continue;
    if (DOC_NETS.some((n) => n[0] === o[0] && n[1] === o[1] && n[2] === o[2])) continue;
    return true;
  }
  return false;
}

// `.local` etc. only counts as a hostname ending: not when followed by a dot
// or a word character (settings.local.json, foo.localhost).
export function hasInternalHostname(line) {
  return /\b[a-z0-9-]+\.(?:internal|lan|local|home\.arpa)(?![\w-])(?!\.\w)/i.test(line);
}

export function hasBearerToken(line) {
  for (const m of line.matchAll(/bearer\s+(\S+)/gi)) {
    const tok = m[1].replace(/[`"'.,;:)]+$/, '');
    if (/^<[^>]+>/.test(tok) || /^\$\{/.test(tok) || /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/.test(tok)) continue;
    if (/^[a-z]+(?:-[a-z]+)+$/.test(tok)) continue; // your-api-key, your-key-here
    // A real token is long, token-shaped and contains a digit.
    if (tok.length >= 16 && /^[A-Za-z0-9._~+\/-]+$/.test(tok) && /\d/.test(tok)) return true;
  }
  return false;
}

export const PATTERNS = [
  [hasBearerToken, 'bearer token that is not a placeholder'],
  [hasBadIPv4, 'IPv4 address'],
  [hasInternalHostname, 'internal hostname'],
];
