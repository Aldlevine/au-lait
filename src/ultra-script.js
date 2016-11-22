const DEFAULT_TAG = 'div';

const VOID_ELEMENTS = {
  area: true, base: true, br: true, col: true, embed: true,
  hr: true, img: true, input: true, keygen: true, link: true,
  meta: true, param: true, source: true, track: true, wbr: true
};

module.exports = {
  US,
  IF,
  UNLESS,
  EACH,
}

function parseTag (tag) {
  let el, classes=[], attrs={}, s;
  let split = tag.replace(/\s/g, '').split(/(#|\.)/);
  el = split.shift() || DEFAULT_TAG;
  while ( s=split.shift() ) {
    if ( s == '.' ) {
      classes.push(split.shift());
      continue;
    }
    if ( s == '#' ) {
      if ( attrs.id ) throw SyntaxError();
      attrs.id = split.shift();
      continue;
    }
    throw SyntaxError();
  }
  if ( classes.length ) attrs.class = classes.join(' ');
  return {el, attrs};
}

function US ( ..._args ) {
  let args = _args.slice();
  let el, attrs={}, children, ret='';
  if ( typeof args[0] === 'string' )
    ({el, attrs} = parseTag(args.shift()));
  if ( typeof args[0] === 'object' && !Array.isArray(args[0]) )
    Object.assign(attrs, args.shift());
  children=args;

  if ( el ) {
    ret = `<${el}`;
    for ( let attr in attrs ) {
      // We can do something special with certain attributes (style, data, events)
      ret += ` ${attr}="${attrs[attr]}"`
    }
  }
  if ( VOID_ELEMENTS[el] ) {
    // VOID
    ret += '/>';
  } else {
    if ( el ) ret += '>';
    for ( let child of children ) {
      if ( typeof child === 'string' ) {
        ret += child;
      } else if ( Array.isArray(child) ) {
        ret += US(...child);
      }
    }
    if ( el ) ret += `</${el}>`;
  }
  return ret;
}

function IF (cond) {
  return cond ? (val)=>val : ()=>void 0;
}

function UNLESS (cond) {
  return !cond ? (val)=>val : ()=>void 0;
}

function EACH (iter) {
  return iter && iter.length ? (cb)=>iter.map(cb) : ()=>void 0;
}
