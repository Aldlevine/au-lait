module.exports = ($$)=>{
module.exports =
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
}