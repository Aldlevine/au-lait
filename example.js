const {US, IF, UNLESS, EACH} = require('./src/ultra-script');

let x = 1;
let arr = ['ONE','TWO','THREE'];

let html = US(
  ['table#winning-table', {name: 'TEXTICLE'},
    ['tr', ['th.corner'], ['th.col', 'Header 1'], ['th.col', 'Header 2']],
    ['tr', ['th.row', 'Row label 1'], ['td.cell', 'R1 C1'], ['td.cell', 'R1 C2']],
    ['tr', ['th.row', 'Row label 2'], ['td.cell', 'R2 C1'], ['td.cell', 'R2 C2']]
  ],
  ['br'],
  'TEXT',
  ['br'],['br'],
  IF( x == 1)( ['h4', {style: 'color: red'}, 'x == 1'] ),
  UNLESS( x == 1)( ['','x != 1'] ),
  ['br'],
  EACH( arr )( (el)=>['', el] )
);

console.log( html );
