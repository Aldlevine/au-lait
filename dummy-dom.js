let US = {
  createElement: (selector, props, cb) => {
    let tagname = selector.split(/#|\./)[0];
    let el = document.createElement(tagname);
    for(let key in props) el.setAttribute(key, props[key]);
    cb({add:(child)=>{el.appendChild(child)}});
    return el;
  },
  createText: (str) => {
    return document.createTextNode(str);
  },
  createComment: (str) => {
    return document.createComment(str);
  }
}
