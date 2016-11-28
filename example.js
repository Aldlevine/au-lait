let fs = require('fs');
let util = require('util');

let {compile} = require('./src');

require.extensions['.us'] = (module, filename) => {
  let data = fs.readFileSync(filename);
  module._compile(compile(data.toString(), {template: true, file: filename}), filename);
}

let template = require('./example.us');
let html = template({
  users: [
    {name: 'Aleksander'},
    {name: 'Benedict'},
    {name: 'Cortland', winner: true}
  ]
});

fs.writeFileSync('./example.html', html);
console.log(template+'');
