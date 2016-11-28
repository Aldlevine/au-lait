const fs = require('fs');
const path = require('path');
const aulait = require('../src');

let template = aulait.load(module, './basic.al');
let html = template(['Adam', 'Benjamin', 'Chris']);

console.log(template+'');

fs.writeFileSync(path.join(__dirname, 'basic.html'), html);
