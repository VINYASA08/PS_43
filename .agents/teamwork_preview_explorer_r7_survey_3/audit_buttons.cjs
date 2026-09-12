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
console.log('Total TSX files:', files.length);

const deadButtons = [];
const emptyHrefs = [];
const buttonsWithoutOnClickOrSubmit = [];
const cursorPointerElementsWithoutClick = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const relPath = path.relative(srcDir, f).replace(/\\/g, '/');
  const lines = content.split('\n');

  // Check empty hrefs or hash hrefs
  lines.forEach((line, idx) => {
    if (/href\s*=\s*["'](#|\s*)["']/.test(line)) {
      emptyHrefs.push({ file: relPath, line: idx + 1, content: line.trim() });
    }
  });

  // Regex to match <button ... > tags
  const buttonRegex = /<button\b([^>]*)>/gs;
  let match;
  while ((match = buttonRegex.exec(content)) !== null) {
    const attrs = match[1];
    const hasOnClick = /onClick\s*=/.test(attrs);
    const isSubmit = /type\s*=\s*["']submit["']/.test(attrs);
    const isReset = /type\s*=\s*["']reset["']/.test(attrs);
    
    // Find line number
    const lineNo = content.substring(0, match.index).split('\n').length;

    if (!hasOnClick && !isSubmit && !isReset) {
      buttonsWithoutOnClickOrSubmit.push({
        file: relPath,
        line: lineNo,
        snippet: match[0].replace(/\s+/g, ' ').substring(0, 120)
      });
    }

    // Check if onClick has empty function
    if (/onClick\s*=\s*\{\s*(\(\s*\)|e|\w+)\s*=>\s*\{\s*\}\s*\}/.test(attrs) || /onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*void\s*0\s*\}/.test(attrs)) {
      deadButtons.push({
        file: relPath,
        line: lineNo,
        type: 'empty_handler',
        snippet: match[0]
      });
    }
  }

  // Check elements with cursor-pointer that are not button, a, input, select, label
  // e.g. <div ... cursor-pointer ... > or <span ... cursor-pointer ... > without onClick
  const nonButtonPointerRegex = /<(div|span|svg|p|img)\b([^>]*cursor-pointer[^>]*)>/g;
  let cpMatch;
  while ((cpMatch = nonButtonPointerRegex.exec(content)) !== null) {
    const tag = cpMatch[1];
    const attrs = cpMatch[2];
    const hasOnClick = /onClick\s*=/.test(attrs);
    const lineNo = content.substring(0, cpMatch.index).split('\n').length;
    if (!hasOnClick) {
      cursorPointerElementsWithoutClick.push({
        file: relPath,
        line: lineNo,
        tag,
        snippet: cpMatch[0].replace(/\s+/g, ' ').substring(0, 120)
      });
    }
  }
});

console.log('\n=== 1. EMPTY / HASH HREFS === (' + emptyHrefs.length + ')');
console.log(JSON.stringify(emptyHrefs, null, 2));

console.log('\n=== 2. BUTTONS WITHOUT ONCLICK OR TYPE=SUBMIT/RESET === (' + buttonsWithoutOnClickOrSubmit.length + ')');
console.log(JSON.stringify(buttonsWithoutOnClickOrSubmit, null, 2));

console.log('\n=== 3. BUTTONS WITH EMPTY ONCLICK HANDLERS === (' + deadButtons.length + ')');
console.log(JSON.stringify(deadButtons, null, 2));

console.log('\n=== 4. CURSOR-POINTER ELEMENTS WITHOUT ONCLICK === (' + cursorPointerElementsWithoutClick.length + ')');
console.log(JSON.stringify(cursorPointerElementsWithoutClick, null, 2));
