<@Children:$$.Component>
  <?render()>
    if ( @children.size == 0 ) <|' has no children'>
    else if ( @children.size == 1 ) <|' has 1 child'>
    else <|` has ${@children.size} children`>

    if ( @children.size > 0 ) <:ul><&@children>

<@Person:$$.Component>
  style () {
    let style = {};
    if ( @children.size > 1 ) style.color = 'red';
    else if ( @children.size > 0 ) style.color = 'orange';
    return style;
  }

  <?render()>
    <:li><:div {style: @style()}>
      <|@props.name>
      <#Children {parent: @props.name}>
        for ( let child of @children )
          <:li><&child>

module.exports =
<?({people=[]}={})>
  <:doctype 'html'>
  <:html>
    <:title><|'Hello World'>
  <:body>
    <:h1#title><|'People'>
    <:ul#people>
      for ( let person of people ) {
        <#Person person>
          for ( let child of person.children ) <|child>
      }
  <\'Just a comment to show you how comments work'>
