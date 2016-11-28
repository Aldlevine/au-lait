const Scanner = require('./scanner');
const Tag = require('./tag');
const { TAG_CONTAINER,
        DOCUMENT,
        ELEMENT,
        TEXT,
        COMMENT,
        REFERENCE,
        CLASS,
        CONTAINERS,
        INDENT_CHAR } = require('./constants');


module.exports = {
  default: compile,
  compile,
};


function isContainerStart (char) {
  for ( let con of CONTAINERS ) {
    if ( char == con[0] ) return true;
  }
  return false;
}


function parseBlockComment (scr) {
  let char;
  let value = '';
  let i = 0;
  while ( char = scr.next() ) {
    i++;
    if ( char == '*' && scr.peek()[0] == '/' ) {
      scr.next()
      return value;
    }
    value += char;
  }
  scr.prev(i);
  scr.error('Unterminated block comment');
}


function parseLineComment (scr) {
  let char;
  let value = '';
  while ( char = scr.next() ) {
    // Comment over
    if ( char == '\n' ) {
      scr.prev();
      return value;
    }
    value += char;
  }
}


function parseString (scr, delim) {
  let char;
  let escape = false;
  let value = '';
  let expr;
  let i = 0;
  while ( char = scr.next() ) {
    i++;
    // Escape
    if ( char == '\\' ) {
      escape = !escape;
      value += char;
      continue;
    }
    // Interpolation
    if ( char == '$' && scr.peek()[0] == '{' && !escape ) {
      expr = parseContainer(scr);
      value += char + expr;
      continue;
    }
    // String Over
    if ( char == delim && !escape ) {
      return value;
    }
    value += char;
  }
  scr.prev(i);
  scr.error('Unterminated string constant');
}


function parseContainer (scr) {
  let char;
  let expr = '';
  let containerLevels = {};
  let depth = 0;
  let value;
  let i = 0;
  // Build list of container counts
  for ( let str of CONTAINERS ) {
    containerLevels[str] = 0;
  }
  while ( char = scr.next() ) {
    i++;
    // Check containerLevel
    depth = 0;
    for ( let container in containerLevels ) {
      let index = container.indexOf(char);
      if ( index == 0 ) containerLevels[container]++;
      else if ( index == 1 ) containerLevels[container]--;
      depth += containerLevels[container];
    }

    // This
    if ( char == CLASS ) {
      expr += 'this';
      if ( /[a-zA-Z\$_]/.test(scr.peek()[0]) ) expr += '.';
      continue;
    }

    // String
    if ( char == '\'' || char == '"' || char == '`' ) {
      value = parseString(scr, char);
      expr += char + value + char;
      continue;
    }

    // Comment
    if ( char == '/' ) {
      // Block Comment
      if ( scr.peek()[0] == '*' ) {
        scr.next();
        value = parseBlockComment(scr);
        expr += '/*' + value + '*/';
        continue;
      }

      // Line Comment
      if ( scr.peek()[0] == '/' ) {
        scr.next();
        value = parseLineComment(scr);
        expr += '//' + value;
        continue;
      }
    }

    expr += char;
    if ( depth == 0 ) {
      return expr;
    }
  }
  scr.prev(i+1);
  scr.error('Unclosed container');
}


function parseId (scr, delim) {
  let char;
  let id = '';
  let i = 0;
  while ( char = scr.next() ) {
    // End
    if ( char == ' ' || char == '\n' || char == '\r' || char == '\t' || char == TAG_CONTAINER[1] || delim.test(char) ) {
      scr.prev();
      return id;
    }
    // Invalid
    if ( ( i == 0 && !/[a-zA-Z_\$]/.test(char) ) || !/[0-9a-zA-Z_\$]/.test(char) )
      scr.error('Invalid character in identifier');
    id += char;
    i++;
  }
}


function parseIdClass (scr, delim) {
  let char;
  let id = '';
  let i = 0;
  while ( char = scr.next() ) {
    // End
    if ( char == ' ' || char == '\n' || char == '\r' || char == '\t' || char == TAG_CONTAINER[1] || delim.test(char) ) {
      scr.prev();
      return id;
    }
    // Invalid
    if ( ( i == 0 && !/[a-zA-Z_\$]/.test(char) ) || !/[0-9a-zA-Z_\$\-]/.test(char) )
      scr.error('Invalid character in identifier');
    id += char;
    i++;
  }
}


function parseSelector (scr) {
  let char;
  let i = 0;
  let tagname = '';
  let id = '';
  let classList = [];
  let tmp;
  while ( char = scr.next() ) {
    // End
    if ( char == ' ' || char == '\n' || char == '\r' || char == '\t' || char == TAG_CONTAINER[1] ) {
      scr.prev();
      return {tagname, id, classList};
    }
    // Id
    if ( char == '#' ) {
      if ( id.length ) scr.error('Redefinition of id in selector');
      id = parseIdClass(scr, /#|\./);
      if ( id.length == 0 ) scr.error('Expected identifier in id segment of selector');
      continue;
    }
    // Class
    if ( char == '.' ) {
      tmp = parseIdClass(scr, /#|\./);
      if ( tmp.length == 0 ) scr.error('Expected identifier in class segment of selector');
      classList.push( tmp );
      continue;
    }
    // Tagname
    if ( !/[a-zA-Z0-9]/.test(char) ) scr.error(`Invalid character "${char}" in tagname`);
    tagname += char;
  }
}


function parseExpression (scr) {
  let char;
  let expr = '';
  let peek;
  while ( char = scr.next() ) {
    // Container
    if ( isContainerStart(char) ) {
      scr.prev();
      expr += parseContainer(scr);
      continue;
    }

    // This
    if ( char == CLASS ) {
      expr += 'this';
      if ( /[a-zA-Z\$_]/.test(scr.peek()[0]) ) expr += '.';
      continue;
    }

    // String
    if ( char == '\'' || char == '"' || char == '`'  ) {
      expr += char + parseString(scr, char) + char;
      continue;
    }

    // Comment
    if ( char == '/' ) {
      peek = scr.peek();
      // Block Comment
      if ( peek[0] == '*' ) {
        scr.next()
        value = parseBlockComment(scr);
        expr += '/*' + value + '*/';
        continue;
      }
      // Line Comment
      if ( peek[0] == '/' ) {
        scr.next();
        value = parseLineComment(scr);
        expr += '//' + value;
        continue;
      }
    }

    // End
    if ( char == ' ' || char == '\n' || char == '\r' || char == '\t' || char == TAG_CONTAINER[1] ) {
      scr.prev();
      return expr;
    }
    expr += char;
  }
}

function parseTag (scr) {
  let declare = false;
  let returns = false;
  let char = scr.next();
  let tag;

  // Declare
  if ( char == TAG_CONTAINER[0] ) {
    declare = true;
    char = scr.next();
  }

  // Returns
  if ( char == TAG_CONTAINER[0] ) {
    returns = true;
    char = scr.next();
  }

  // Document
  if ( char == DOCUMENT ) {
    let value = parseExpression(scr);
    tag = new Tag({type: 'document', declare, returns, value});
  }

  // Element
  if ( char == ELEMENT ) {
    let selector = parseSelector(scr);
    scr.eatWhitespace();
    let value = parseExpression(scr);
    tag = new Tag({type: 'element', declare, returns, tagname: selector.tagname, id: selector.id, classList: selector.classList, value});
  }

  // Text
  else if ( char == TEXT ) {
    let value = parseExpression(scr);
    tag = new Tag({type: 'text', declare, returns, value});
  }

  // Comment
  else if ( char == COMMENT ) {
    let value = parseExpression(scr);
    tag = new Tag({type: 'comment', declare, returns, value});
  }

  // Reference
  else if ( char == REFERENCE ) {
    let value = parseExpression(scr);
    tag = new Tag({type: 'reference', declare, returns, value});
  }

  // Construct
  else if ( char == CLASS ) {
    let construct = parseExpression(scr);
    scr.eatWhitespace();
    let value = parseExpression(scr);
    tag = new Tag({type: 'construct', declare, returns, construct, value});
  }

  scr.eatWhitespace();
  if ( scr.next() != TAG_CONTAINER[1] )
    scr.error(`Expected ${TAG_CONTAINER[1]}`);

  return tag;
}

function parse (...args) {
  let opts = Object.assign({
    // file,
    indentChar: INDENT_CHAR.SPACE,
    indentCount: 2,
    indentLevel: -1,
  }, args[1]);
  let scr = typeof args[0] === 'string' ? new Scanner(args[0], opts.file, opts.indentChar, opts.indentCount) : args[0];

  let fullContent = [];
  let content = [];
  let indentLevel = opts.indentLevel;
  let chunk = '';
  let tag;
  let value;
  let peek;
  let type;

  while ( char = scr.next() ) {
    // New Line
    if ( char == '\n' ) {
      content.push(chunk);
      indentLevel = scr.getIndentLevel();
      chunk = char + Array(indentLevel * opts.indentCount).join(opts.indentChar);
      if( indentLevel <= opts.indentLevel /*&& scr.peek()[0] != '\n'*/) {
        if ( indentLevel > 0 )
          scr.prev(chunk.length+1)
        else
          scr.prev(chunk.length)
        chunk = '';
        break;
      }
      continue;
    }

    // Tag Container
    peek = scr.peek();
    if ( char == TAG_CONTAINER[0] ) {
      type = peek[0];
      if ( type == TAG_CONTAINER[0] ) type = peek[1];
      if ( type == TAG_CONTAINER[0] ) type = peek[2];
      if ( type == DOCUMENT || type == ELEMENT || type == TEXT || type == COMMENT || type == REFERENCE || type == CLASS ) {
        content.push(chunk);
        tag = parseTag(scr);
        tag.content = parse(scr, {indentLevel});
        tag.indent = Array(indentLevel * opts.indentCount).join(opts.indentChar);
        content.push(tag);
        chunk = '';
        continue;
      }
    }

    // This
    if ( char == CLASS ) {
      chunk += 'this';
      if ( /[a-zA-Z\$_]/.test(scr.peek()[0]) ) chunk += '.';
      continue;
    }

    // String
    if ( char == '\'' || char == '"' || char == '`' ) {
      value = parseString(scr, char);
      chunk += char + value + char;
      continue;
    }

    // Comment
    if ( char == '/' ) {
      peek = scr.peek();
      // Block Comment
      if ( peek[0] == '*' ) {
        scr.next()
        value = parseBlockComment(scr);
        chunk += '/*' + value + '*/';
        continue;
      }
      // Line Comment
      if ( peek[0] == '/' ) {
        scr.next();
        value = parseLineComment(scr);
        chunk += '//' + value;
        continue;
      }
    }

    chunk += char;
  }
  if ( chunk.length ) content.push(chunk);

  return content;
}


function transpile (content, template) {
  let ret = '';
  let chunkStr;
  let chunkContent;
  let chunkIndent;
  for ( let chunk of content ) {
    if ( typeof chunk === 'string' ) {
      ret += chunk;
      continue;
    }

    chunkStr = chunk.returns ? 'return ' : '';
    chunkStr += chunk.declare ? '$$.' : '$$parent.';
    if ( chunk.type == 'document' ) {
      chunkStr += `document(${chunk.value||'null'}, ($$parent)=>{${transpile(chunk.content)}\n${chunk.indent}})`;
    }
    else if ( chunk.type == 'element' ) {
      chunkContent = transpile(chunk.content);
      chunkIndent = /\n/.test(chunkContent) ? `\n${chunk.indent}` : '';
      chunkStr += `element("${chunk.tagname}", "${chunk.id}", ${JSON.stringify(chunk.classList)}, ${chunk.value||'{}'}, ($$parent)=>{${chunkContent}${chunkIndent}})`;
    }
    else if ( chunk.type == 'text' || chunk.type == 'comment' || chunk.type == 'reference' ) {
      chunkStr += `${chunk.type}(${chunk.value})`;
    }
    else if ( chunk.type == 'construct' ) {
      chunkContent = transpile(chunk.content);
      chunkIndent = /\n/.test(chunkContent) ? `\n${chunk.indent}` : '';
      chunkStr += `construct(${chunk.construct}, ${chunk.value||'{}'}, ($$parent)=>{${chunkContent}${chunkIndent}})`;
    }

    ret += chunkStr;
  }
  return ret;
}


function compile (str, opts={}) {
  let content = parse(str, opts);
  let js = transpile(content, opts.template);
  if ( opts.template ) {
    let resolvedDom = require.resolve('./dom').replace('\\', '/');
    js = `const $$ = require('${resolvedDom}');\nmodule.exports = ($={})=>{\n${js}\n}`;
  }
  return js;
}
