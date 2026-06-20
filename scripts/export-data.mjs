import fs from 'fs';
import ts from 'typescript';
const files = [
  ['src/data/books.ts','booksData','public/data/books.json'],
  ['src/data/biographies.ts','biographiesData','public/data/biographies.json'],
  ['src/data/audio.ts','audioData','public/data/audio.json'],
  ['src/data/fawaid.ts','fawaidData','public/data/fawaid.json'],
  ['src/data/categories.ts','categoriesData','public/data/categories.json'],
];
fs.mkdirSync('public/data',{recursive:true});
for (const [file, name, out] of files) {
  let src = fs.readFileSync(file,'utf8');
  src = src.replace(/^import[^\n]+\n/gm,'');
  src = src.replace(new RegExp(`export const ${name}:[^=]+=`), `exports.${name} =`);
  const js = ts.transpileModule(src,{ compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const exports = {};
  Function('exports', js)(exports);
  fs.writeFileSync(out, JSON.stringify(exports[name], null, 2)+'\n');
  console.log(`${out}: ${exports[name].length} records`);
}
