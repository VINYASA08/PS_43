const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const appDir = path.resolve(__dirname, '../../web/src/app');
const appFiles = walk(appDir);

// Collect all existing page routes
const existingPages = [];
appFiles.forEach(f => {
  if (path.basename(f) === 'page.tsx') {
    let rel = path.relative(appDir, f).replace(/\\/g, '/');
    if (rel === 'page.tsx') {
      existingPages.push('/');
    } else {
      let route = '/' + rel.replace('/page.tsx', '');
      existingPages.push(route);
    }
  }
});

console.log('=== EXISTING APP ROUTES === (' + existingPages.length + ')');
console.log(JSON.stringify(existingPages.sort(), null, 2));

// Collect all target routes from Link href and router.push/replace
const srcDir = path.resolve(__dirname, '../../web/src');
const allSrcFiles = walk(srcDir);

const routeLinks = [];
allSrcFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const relPath = path.relative(srcDir, f).replace(/\\/g, '/');

  // Match href="..." and href={`...`}
  const linkRegex = /href=(?:["']([^"']+)["']|\{`([^`]+)`\})/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const target = match[1] || match[2];
    const lineNo = content.substring(0, match.index).split('\n').length;
    routeLinks.push({ file: relPath, line: lineNo, target });
  }

  // Match router.push(...) and router.replace(...)
  const routerRegex = /router\.(?:push|replace)\((?:["']([^"']+)["']|\{`([^`]+)`\})/g;
  while ((match = routerRegex.exec(content)) !== null) {
    const target = match[1] || match[2];
    const lineNo = content.substring(0, match.index).split('\n').length;
    routeLinks.push({ file: relPath, line: lineNo, target, isRouter: true });
  }
});

console.log('\n=== COLLECTED ROUTE TARGETS === (' + routeLinks.length + ')');

// Check each target against existing pages
function matchesRoute(target, pages) {
  // If hash only
  if (target.startsWith('#')) return true;
  
  // Extract path without query and hash
  let clean = target.split('?')[0].split('#')[0];
  if (!clean.startsWith('/')) clean = '/' + clean;

  // Exact match
  if (pages.includes(clean)) return true;

  // Dynamic route matches
  // e.g. /challenge/[id] matches /challenge/${...} or /challenge/123
  for (const page of pages) {
    if (page.includes('[')) {
      // convert [param] to regex [^/]+
      const pattern = '^' + page.replace(/\[\w+\]/g, '[^/]+') + '$';
      const re = new RegExp(pattern);
      if (re.test(clean)) return true;
      // Also if clean has ${...}
      const rawPattern = '^' + page.replace(/\[\w+\]/g, '\\$\\{[^}]+\\}') + '$';
      if (new RegExp(rawPattern).test(clean)) return true;
    }
  }

  return false;
}

const unmatched = [];
routeLinks.forEach(item => {
  if (!matchesRoute(item.target, existingPages)) {
    unmatched.push(item);
  }
});

console.log('\n=== UNMATCHED OR BROKEN ROUTE LINKS === (' + unmatched.length + ')');
console.log(JSON.stringify(unmatched, null, 2));
