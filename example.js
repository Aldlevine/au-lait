let fs = require('fs');
let util = require('util');

let {compile} = require('./src');

fs.readFile('./example.us', (err, data)=>{
  if (err) return console.log(err);
  console.log(compile(data.toString()));
});
