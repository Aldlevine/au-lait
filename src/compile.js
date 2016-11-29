module.exports = {compile, compileFile};

const fs = require('fs');
const parse = require('./parse')
const compileAST = require('./compile-ast');

function compile (str, opts={}) {
  let content = parse(str, opts);
  let js = compileAST(content);
  return js;
}

function compileFile (file, opts) {
  return compile(fs.readFileSync(file).toString(), Object.assign({}, opts, {file}));
}
