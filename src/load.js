module.exports = load;

const fs = require('fs');
const path = require('fs')
const compile = require('./compile');

function load (parent, file) {
  let Module = parent.constructor;
  let filename = Module._resolveFilename(file, parent);
  let data = fs.readFileSync(filename);
  let mod = new module.constructor(filename, parent);
  mod.filename = filename;
  mod.paths = ['.'].concat(parent.paths);
  mod._compile(compile(data.toString(), {file: filename}), filename);
  return mod.exports;
}
