const VOID_ELEMENTS = {
  area: true, base: true, br: true, col: true, embed: true,
  hr: true, img: true, input: true, keygen: true, link: true,
  meta: true, param: true, source: true, track: true, wbr: true
}


function camelDash (str) {
  return str.replace(/[A-Z]/g, (match)=>'-'+match.toLowerCase());
}


class $$ {
  constructor () {
    this.children = new Set();
  }

  static group (...args) { return new $$Group(...args) }
  group (...args) { this.add(new $$Group(...args)) }

  static element (...args) { return new $$Element(...args) }
  element (...args) { this.add(new $$Element(...args)) }

  static text (...args) { return new $$Text(...args) }
  text (...args) { this.add(new $$Text(...args)) }

  static comment (...args) { return new $$Comment(...args) }
  comment (...args) { this.add(new $$Comment(...args)) }

  static reference (ref) { return ref }
  reference (ref) { this.add(ref) }

  static construct (comp, props, cb) { return new comp(props, cb) }
  construct (comp, props, cb) { this.add(new comp(props, cb)) }

  add (child) {
    if ( child[Symbol.iterator] ) {
      for ( let el of child ) {
        this.children.delete(el);
        this.children.add(el);
      }
    } else {
      this.children.delete(child);
      this.children.add(child);
    }
  }

  clone () {}

  toDom() {}

  toString() {}
}


class $$Group extends $$ {
  constructor (cb) {
    super();
    cb && cb(this);
  }

  clone () {
    let clone = new this.constructor(this.value);
    for ( let child of this.children ) {
      clone.children.add(child.clone());
    }
    return clone;
  }

  toDom () {
    let el = document.createDocumentFragment();
    for ( let child of this.children )
      el.appendChild(child.toDom());
    return el;
  }

  toString () {
    let ret = '';
    for ( let child of this.children )
      ret += `${child.toString()}`;
    return ret;
  }
}


class $$Element extends $$ {
  constructor (name, id, classList, attrs, cb) {
    super();
    this.name = name || 'div';
    this.attrs = attrs;

    if ( id ) this.attrs.id = id;

    if ( attrs.class && typeof attrs.class === 'string' ) {
      attrs.class = attrs.class.split(/\s+/);
    }

    if ( classList && classList.length ) {
      attrs.class = this.attrs.class || [];
      attrs.class.push(...classList);
    }

    cb && cb(this);
  }

  clone () {
    let clone = new this.constructor(this.name, null, null, this.attrs);
    for ( let child of this.children ) {
      clone.children.add(child.clone());
    }
    return clone;
  }

  toDom () {
    // Doctype
    if ( this.name == 'doctype' ) return null;

    let el = document.createElement(this.name);
    for ( let key in this.attrs ) {
      // Class
      if ( key == 'class' ) {
        el.setAttribute(key, this.attrs[key].join(' '));
      }
      // Style
      else if ( key == 'style' && typeof this.attrs[key] == 'object' ) {
        let style = this.attrs[key];
        for ( let prop in style ) {
          el.style[prop] = style[prop];
        }
      }
      // Default
      else {
        el.setAttribute(key, this.attrs[key]);
      }
    }
    for ( let child of this.children )
      el.appendChild(child.toDom());
    return el;
  }

  toString () {
    // Doctype
    if ( this.name == 'doctype' ) {
      return `<!DOCTYPE ${this.attrs}>`;
    }

    let ret = '';
    let attrs = '';
    for ( let key in this.attrs ) {
      // Class
      if ( key == 'class' ) {
        attrs += ` ${key}="${this.attrs[key].join(' ')}"`;
      }
      // Style
      else if ( key == 'style' && typeof this.attrs[key] == 'object' ) {
        let style = this.attrs[key];
        attrs += ` ${key}="`
        for ( let prop in style ) {
          attrs += `${camelDash(prop)}:${style[prop]};`;
        }
        attrs += '"';
      }
      // Default
      else {
        attrs += ` ${key}="${this.attrs[key]}"`;
      }
    }
    ret += `<${this.name}${attrs}`;
    if ( !VOID_ELEMENTS[this.name] ) {
      ret += '>';
      let children = '';
      for ( let child of this.children )
        children += child.toString();
      ret += children;
      return ret + `</${this.name}>`;
    }
    return ret + '/>';
  }
}


class $$Text extends $$ {
  constructor (value) {
    super();
    this.value = value;
  }

  add () {}

  clone () {
    return new this.constructor(this.value);
  }

  toDom () {
    return document.createTextNode(this.value);
  }

  toString () {
    return this.value;
  }
}


class $$Comment extends $$ {
  constructor (value) {
    super();
    this.value = value;
  }

  add () {}

  clone () {
    return new this.constructor(this.value);
  }

  toDom () {
    return document.createComment(this.value);
  }

  toString () {
    return `<!--${this.value}-->`;
  }
}


class $$Component extends $$ {
  constructor (props, cb) {
    super();
    this.props = props;
    cb && cb(this);
  }

  clone () {
    let clone = new this.constructor(this.props);
    for ( let child of this.children ) {
      clone.children.add(child.clone());
    }
    return clone;
  }

  toDom () {
    return this.render().toDom();
  }

  toString () {
    return this.render().toString();
  }

  render () {
    return new $$();
  }
}

$$.Component = $$Component;
module.exports = $$;
