const util = require('util');

class Super extends $$.Component {
  render () {
    <<<:div.wtf @props>
      if ( 1 < @children.size ) {
        <|'We have more than one here...'>
        <:br>
        <:br>
        <:br>
      }
      <&@children>
  }
}

class Sub extends Super {
  render () {
    <<<%>
      <:h3.title><|'SUPER'>
      <&super.render()>
      let thing = <<:pre>
        <|'Hello'>
      <&thing>
      <:#winning.winning-for-real>
      <&thing.clone()>
  }
}

<<<%'html'>
  <:html>
    <:head>
      <:title><|'Hello World'>
    <:body>
      <:h1><|'Hello World!!!'>
      <:ul#list>
        for ( let user of $.users ) {
          <:li>
            <|user.name>
            if(user.winner) <|' IS THE WINNER!!!'>
        }
      <:div {style: {color: 'red', fontWeight: 'bold'}}><|'NEATO!'>
      <\'This is a comment'>
      <@Sub {key: 'prop'}>
        <:div><|'Hello'>
        <:div><|'World'>
        <\'This is another comment!'>
