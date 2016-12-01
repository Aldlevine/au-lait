const fs = require('fs');
const path = require('path');
const aulait = require('../src');

fs.writeFileSync(path.join(__dirname, 'basic.template.js'), aulait.compileFile(path.join(__dirname, 'basic.al')));

let template = aulait.load(module, './basic.al');

// require('../register');
// let template = require('./basic.al');

let html = template(['Adam', 'Benjamin', 'Chris']);
fs.writeFileSync(path.join(__dirname, 'basic.html'), html);
