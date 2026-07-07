import fs from 'fs';
import path from 'path';

const replaceMap = {
  'indigo-650': 'indigo-600',
  'indigo-655': 'indigo-600',
  'indigo-705': 'indigo-700',
  'indigo-550': 'indigo-600',
  'slate-150': 'slate-200',
  'slate-350': 'slate-300',
  'slate-405': 'slate-400',
  'slate-450': 'slate-400',
  'slate-455': 'slate-500',
  'slate-550': 'slate-500',
  'slate-650': 'slate-600',
  'slate-655': 'slate-600',
  'slate-850': 'slate-800',
  '#0b0f19': 'black',
};

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.html')) {
      results.push(fullPath);
    }
  });
  return results;
};

// We walk and process files in src/
const files = walk('./src');

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  Object.keys(replaceMap).forEach((key) => {
    const regex = new RegExp(key, 'g');
    content = content.replace(regex, replaceMap[key]);
  });
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated colors in: ${file}`);
  }
});
