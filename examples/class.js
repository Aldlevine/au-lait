const fs = require('fs');
const path = require('path');
const aulait = require('../src');

let template = aulait.load(module, './class.al');
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
