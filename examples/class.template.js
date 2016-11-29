
const $$ = require('../src/dom');

class Children extends $$.Component {
  render () {return $$.group(($$parent)=>{
    if ( this.children.size == 0 ) $$parent.text(' has no children')
    else if ( this.children.size == 1 ) $$parent.text(' has 1 child')
    else $$parent.text(` has ${this.children.size} children`)
    if ( this.children.size > 0 ) $$parent.element("ul", "", [], {}, ($$parent)=>{$$parent.reference(this.children)})
  })}
}
class Person extends $$.Component {
  style () {
    let style = {};
    if ( this.children.size > 1 ) style.color = 'red';
    else if ( this.children.size > 0 ) style.color = 'orange';
    return style;
  }

  render () {return $$.group(($$parent)=>{
    $$parent.element("li", "", [], {}, ($$parent)=>{$$parent.element("div", "", [], {style: this.style()}, ($$parent)=>{
      $$parent.text(this.props.name)
      $$parent.construct(Children, {parent: this.props.name}, ($$parent)=>{
        for ( let child of this.children )
          $$parent.element("li", "", [], {}, ($$parent)=>{$$parent.reference(child)})
      })
    })
    })
  })}
}
module.exports =
({people=[]}={})=>{return $$.group(($$parent)=>{
  $$parent.element("doctype", "", [], 'html', ($$parent)=>{})
  $$parent.element("html", "", [], {}, ($$parent)=>{
    $$parent.element("title", "", [], {}, ($$parent)=>{$$parent.text('Hello World')})
  })
  $$parent.element("body", "", [], {}, ($$parent)=>{
    $$parent.element("h1", "title", [], {}, ($$parent)=>{$$parent.text('People')})
    $$parent.element("ul", "people", [], {}, ($$parent)=>{
      for ( let person of people ) {
        $$parent.construct(Person, person, ($$parent)=>{
          for ( let child of person.children ) $$parent.text(child)
        })
      }
    })
  })
  $$parent.comment('Just a comment to show you how comments work')
})}
