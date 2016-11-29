const fs = require('fs');
const aulait = require('aulait');

let index = aulait.load(module, './views/index.al');

fs.writeFileSync('./index.html', index());
