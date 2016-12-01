const fs = require('fs');
const path = require('path');
const aulait = require('../src');

fs.writeFileSync(path.join(__dirname, 'class.template.js'), aulait.compileFile(path.join(__dirname, 'class.al')));

let template = aulait.load(module, './class.al');

// require('../register');
// let template = require('./class.al');

let html = template({
  people: [
    {
      name: 'Aleksander',
      children: ['Anthony'],
    },
    {
      name: 'Benedict',
      children: ['Bartholomew', 'Balthasar']
    },
    {
      name: 'Cortland',
      children: []
    }
  ]
});

fs.writeFileSync(path.join(__dirname, 'class.html'), html);
