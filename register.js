const fs = require('fs');
const compile = require('./src/compile');

require.extensions['.al'] = (module, filename) => {
  let al = fs.readFileSync(filename, 'utf8');
  module._compile(compile(al.toString(), {file: filename}), filename);
}
