# Au Lait

Au Lait is an expressive and unambiguous template language designed around javascript.

The goals in it's design are:
- An explicit yet terse, whitespace significant language that is able to represent anything that HTML can.
- The ability to use arbitrary javascript around and within the language, by merit of the entire language compiling to javascript.
- The ability to use standard javascript control flow (if, for, while) without any work-arounds or special workflows.
- Usablilty both server-side and browser-side by rendering both to strings and DOM.
- Using ES6 to build class based reusable components.

The API is currently subject to change, but the language spec is mostly defined.

### Example
This example shows trivial html generated from Au Lait. `index.al` is exports a function that takes one parameter `name` and returns a document. `index.js` imports that function and calls it, and stores the return value in `html`. `html.toString()` shows the string content of what the template call returned (this could also be `.toDom()` within the browser and will return an `HTMLElement`).

_See examples for more_

index.al
```javascript
module.exports =
<?(names=[])>
  <:doctype 'html'>
  <:html>
    <:head>
      <:title><|'TITLE'>
    <:body>
      <:ul>
        for ( let i=0; i<names.length; i++ ) {
          <:li><|names[i]>
        }
      <\'End of names'>
```
index.js
```javascript
const aulait = require('aulait');
let template = aulait.load(module, './index.al');
let html = template(['Adam', 'Benjamin', 'Chris']);
```
template.toString()
```javascript
(names=[])=>{return $$.group(($$parent)=>{
 $$parent.element("doctype", "", [], 'html', ($$parent)=>{})
 $$parent.element("html", "", [], {}, ($$parent)=>{
   $$parent.element("head", "", [], {}, ($$parent)=>{
     $$parent.element("title", "", [], {}, ($$parent)=>{
       $$parent.text('TITLE')
     })
   })
   $$parent.element("body", "", [], {}, ($$parent)=>{
     $$parent.element("ul", "", [], {}, ($$parent)=>{
       for ( let i=0; i<names.length; i++ ) {
         $$parent.element("li", "", [], {}, ($$parent)=>{
           $$parent.text(names[i])
         })
       }
     })
     $$parent.comment('End of names')
   })
 })
})}
```
html.toString()
```html
<!DOCTYPE html>
<html>
  <head>
    <title>TITLE</title>
  </head>
  <body>
    <ul>
      <li>Adam</li>
      <li>Benjamin</li>
      <li>Chris</li>
    </ul>
    <!--End of names-->
  </body>
</html>
```

### Tags
Au Lait is primarily tag based, but you should understand that the tags all ultimately compile into standard javascript (es6). The tags types are listed below:

_See spec.txt for more info_

- `<:>` Group
  - A group, it doesn't render itself, but does render it's children
- `<:selector [attrs]>` Element
  - A standard html element
  - `<:div#id.class {name:"name"}>` -> `<div id="id" class="class" name="name"></div>`
  - `attrs` doesn't have to be an object literal, any object in scope works just fine!
  - `attrs.style` can be an object, rather than a string (this will apply to `data` eventually)
- `<|expr>` Text
  - An html text node
  - `<|'Hello world'>` -> `Hello world`
  - `expr` can be __any javascript expression__ that returns a string.
- `<\expr>` Comment
  - An html comment
  - `<\'You can see this in the output'>` -> `<!--You can see this in the output-->`
- `<&expr>` Reference
  - Reference tags become whatever you put in them. You can pass in anything returned from another tag. This is particularly useful for handling children within a component.
  - `let el = <<:div>`... elsewhere `<&el>`
- `<@id:expr>` Class
  - Syntactic sugar for an es6 class.
  - `<@Sub:Super>` -> `class Sub extends Super {...}`
- `<#expr expr>` Construct
  - Constructs any class that extends $$.Component
  - `<#Class {key: 'prop'}>` -> `new Class({key: 'prop'})`
    - _Note, this is not exactly how this is outputted, but the effect is the same_
- `<?(id...)>` Function
  - An anonymous function that returns a `Group`
  - `let fn = <?(name, age)><|name+' is '+age+' years old'>`
- `<?id(id...)>` MemberFunction
  - Same as above, but used within a class
  - ```<?render()><|`${@name} is ${@age} years old`>```
- `<<*...>` Declare
  - Used with any tag (except class/function), prevents binding to the parent tag (use to bind to variables)
- `<<<*...>` Return
  - Same as above, but returns the tag.
- `@` This
  - Syntactic sugar for the `this` keyword
