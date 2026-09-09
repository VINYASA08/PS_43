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
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const srcDir = path.resolve(__dirname, '../../web/src');
const files = walk(srcDir);

const lucidePointers = [];
const allInteractiveCards = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const relPath = path.relative(srcDir, f).replace(/\\/g, '/');

  // Check Lucide or custom components with cursor-pointer
  const compRegex = /<([A-Z]\w+)\b([^>]*cursor-pointer[^>]*)>/g;
  let match;
  while ((match = compRegex.exec(content)) !== null) {
    const tag = match[1];
    const attrs = match[2];
    const hasOnClick = /onClick\s*=/.test(attrs);
    const lineNo = content.substring(0, match.index).split('\n').length;
    if (!hasOnClick) {
      lucidePointers.push({
        file: relPath,
        line: lineNo,
        tag,
        snippet: match[0].replace(/\s+/g, ' ').substring(0, 100)
      });
    }
  }
});

console.log('\n=== LUCIDE / REACT COMPONENTS WITH CURSOR-POINTER BUT NO ONCLICK === (' + lucidePointers.length + ')');
console.log(JSON.stringify(lucidePointers, null, 2));
