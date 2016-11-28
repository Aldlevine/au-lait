const $$ = require('./src/dom');

<@Children:$$.Component>
  <?render()>
    if ( @children.size == 0 ) {
      <|' has no children'>
    } else if ( @children.size == 1 ) {
      <|' has 1 child'>
    } else {
      <|` has ${@children.size} children`>
    }
    if ( @children.size > 0 ) {
      <:ul>
        <:li><&@children>
    }

module.exports =
<?({people=[]}={})>
  <:doctype 'html'>
  <:html>
    <:title><|'Hello World'>
  <:body>
    <:h1#title><|'People'>
    <:ul#people>
      for ( let person of people ) {
        <:li>
          let style = {}
          if ( person.children.length > 1 ) style.color = 'red';
          else if ( person.children.length > 0 ) style.color = 'orange';
          <:div {style}>
            <|person.name>
            <#Children {parent: person.name}>
              for ( var child of person.children ) {
                <:div><|child>
              }
      }
  <\'Just a comment to show you how comments work'>
