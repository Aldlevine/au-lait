const fs = require('fs');
const {compileFile} = require('./src/compile');

require.extensions['.al'] = (module, filename) => {
  module._compile(compileFile(filename), filename);
  // let al = fs.readFileSync(filename, 'utf8');
  // module._compile(compile(al.toString(), {file: filename}), filename);
}
