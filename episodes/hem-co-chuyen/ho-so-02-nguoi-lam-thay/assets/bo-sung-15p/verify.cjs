const path = require('node:path');
const {createRequire} = require('node:module');
const studio = path.resolve(__dirname, '../../../../../what-if-studio');
const ts = createRequire(path.join(studio, 'package.json'))('typescript');
const configPath = path.join(studio, 'tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, studio);
const extras = ts.sys.readDirectory(__dirname, ['.tsx']);
const program = ts.createProgram([...parsed.fileNames, ...extras], {...parsed.options, noEmit: true});
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: f => f, getCurrentDirectory: () => studio, getNewLine: () => '\n'
  }));
  process.exit(1);
}
console.log('PASS: studio and supplemental TSX typecheck');
