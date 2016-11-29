const $$ = require('../src/dom');

module.exports =
<?(names=[])>
  <:doctype 'html'>
  <:html>
    <:head>
      <:title>
        <|'TITLE'>
    <:body>
      <:ul>
        for ( let i=0; i<names.length; i++ ) {
          <:li>
            <|names[i]>
        }
      <\'End of names'>
