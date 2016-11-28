module.exports = compile;

const parse = require('./parse')
const compileAST = require('./compile-ast');

function compile (str, opts={}) {
  let content = parse('\n'+str, opts);
  let js = compileAST(content);
  return js;
}
