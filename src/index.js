/**
 * TODO I'd like to abstract out some of the WET code.
 */

module.exports = {
  default: compile,
  compile,
};

const TAG_CONTAINER = '<>';
const DECLARATIVE = '-';
const ADDITIVE = '+';
const CONTAINERS = ['{}','[]','()'];
const INDENT_CHAR = {
  SPACE: ' ',
  TAB: '\t'
}


function eatWhiteSpace (str) {
  return str.replace(/^\s+/, '');
}


function getChar (str) {
  return {str: str.slice(1), char: str[0]};
}


function getIndentLevel (str, indentChar, indentCount) {
  let i = 0;
  // Find all indent characters at beginning of line
  while ( str[i] === indentChar ) i++;
  // Make sure next char is not unused indent char
  for ( key in INDENT_CHAR ) {
    if ( INDENT_CHAR[key] === indentChar ) continue;
    if ( str[i] == INDENT_CHAR[key] ) throw SyntaxError(''); // TODO Better errors
  }

  // Make sure the number of indentChars divides evenly by indentCount
  if ( i % indentCount != 0 ) {
    throw SyntaxError('Uneven Indent'); // TODO Better errors
  }

  return {str: str.slice(i), indentLevel: i/indentCount};
}


function parseBlockComment (str) {
  let char;
  let content = '';
  while ( ({str, char} = getChar(str)).char ) {
    // Comment over
    if ( char == '*' && str[0] == '/' ) {
      str = str.slice(1);
      return {str, content};
    }
    content += char;
  }
  throw SyntaxError(''); // TODO Better errors
}


function parseLineComment (str) {
  let char;
  let content = '';
  while ( ({str, char} = getChar(str)).char ) {
    // Comment over
    if ( char == '\n' || char == '\r' ) {
      return {str: char+str, content};
    }
    content += char;
  }
}


function parseString (str, delim) {
  let char;
  let escape = false;
  let content = '';
  let props;
  while ( ({str, char} = getChar(str)).char ) {
    // Escape
    if ( char == '\\' ) {
      escape = !escape;
      content += char;
      continue;
    }
    // Interpolation
    if ( char == '$' && str[0] == '{' && !escape ) {
      ({str, props} = parseObject(str));
      content += char + props;
      continue;
    }
    // String Over
    if ( char == delim && !escape ) {
      return {str, content};
    }
    content += char;
  }
  throw SyntaxError(''); // TODO Better errors
}


function parseObject (str) {
  let char;
  let props = '';
  let containerLevels = {};
  let depth = 0;
  let content;
  // Build list of container counts
  for ( let str of CONTAINERS ) {
    containerLevels[str] = 0;
  }
  while ( ({str, char} = getChar(str)).char ) {
    // Check containerLevel
    depth = 0;
    for ( let container in containerLevels ) {
      let index = container.indexOf(char);
      if ( index == 0 ) containerLevels[container]++;
      else if ( index == 1 ) containerLevels[container]--;
      depth += containerLevels[container];
    }

    // String
    if ( char == '\'' || char == '"' || char == '`' ) {
      ({str, content} = parseString(str, char));
      props += char + content + char;
      continue;
    }

    // Comment
    if ( char == '/' ) {
      // Block Comment
      if ( str[0] == '*' ) {
        str = str.slice(1);
        ({str, content} = parseBlockComment(str));
        props += '/*' + content + '*/';
        continue;
      }
      // Line Comment
      if ( str[0] == '/' ) {
        str = str.slice(1);
        ({str, content} = parseLineComment(str));
        props += '//' + content;
        continue;
      }
    }

    props += char;
    // We've completed our props
    if ( depth == 0 ) {
      return {str, props};
    }
  }
  throw SyntaxError(''); // TODO Better errors
}


function parseCommentTag (str, tag) {
  ({str, content: tag.value} = parseBlockComment(str));
  str = eatWhiteSpace(str);
  ({str, char} = getChar(str));
  if ( char == TAG_CONTAINER[1] ) {
    return {str, tag};
  }
  throw SyntaxError(''); // TODO Better errors
}


function parseTextTag (str, tag, delim) {
  ({str, content: tag.value} = parseString(str, delim));
  str = eatWhiteSpace(str);
  ({str, char} = getChar(str));
  if ( char == TAG_CONTAINER[1] ) {
    return {str, tag};
  }
  throw SyntaxError(''); // TODO Better errors
}


function parseElementTag (str, tag) {
  let char;
  let selectorDone = false;
  tag.selector = '';
  tag.props = '{}';

  // Collect selector
  while ( ({str, char} = getChar(str)).char ) {
    // Got start of props
    if ( char == '{' ) {
      str = char + str;
      break;
    }
    // Got whitespace
    if ( char == ' ' || char == '\n' || char == '\r' || char == '\t' ) {
    // if ( /\s/.test(char) ) {
      str = eatWhiteSpace(str);
      continue;
    }
    // Got end
    if ( char == TAG_CONTAINER[1] ) {
      // str = str.slice(1);
      return {str, tag};
    }
    // Is valid character?
    if ( !/[a-zA-Z0-9\.\-\_#\$]/.test(char) ) {
      throw SyntaxError(''); // TODO Better errors
    }
    tag.selector += char;
  }

  // Collect props
  if ( str[0] !== '{' )
    throw SyntaxError(''); // TODO Better errors

  ( {str, props: tag.props} = parseObject(str) );

  str = eatWhiteSpace(str);
  ({str, char} = getChar(str));
  if ( char != TAG_CONTAINER[1] ) {
    throw SyntaxError(''); // TODO Better errros
  }

  return {str, tag};
}


function parseTag (str, opts) {
  let tag = {};
  let char, type;
  ({str, char} = getChar(str));
  tag.method = char == opts.declarative ? 'declarative' : 'additive';
  str = eatWhiteSpace(str);

  while ( ({str, char} = getChar(str)).char ) {
    // Comment?
    if ( char == '/' ) {
      // Comment
      if ( str[0] == '*' ) {
        str = str.slice(1);
        tag.type = 'comment';
        return parseCommentTag(str, tag);
      }
      throw SyntaxError(''); // TODO Better errors
    }

    // String
    if ( char == '\'' || char == '"' || char == '`' ) {
      tag.type = 'text';
      return parseTextTag(str, tag, char);
    }

    // ELement
    if ( /[a-zA-Z]/.test(char) ) {
      tag.type = 'element';
      return parseElementTag(char+str, tag);
    }

    // Class
    if ( char == '@' ) {
      tag.type = 'class';
      return parseElementTag(str, tag);
    }

    throw SyntaxError(''); // TODO Better errors
  }

  return {str, tag};
}


function parse (...args) {
  let str = args[0];
  let opts = Object.assign({
    indentChar: INDENT_CHAR.SPACE,
    indentCount: 2,
    tagContainer: TAG_CONTAINER,
    declarative: DECLARATIVE,
    additive: ADDITIVE,
    bufIndentLevel: -1,
  }, args[1]);

  let buf = [];
  let indentLevel = opts.bufIndentLevel;
  let chunk = '';
  let tag;
  let content;

  while ( ({str, char} = getChar(str)).char ) {
    // New Line
    if ( char == '\n' ) {
      buf.push(chunk);
      ({str, indentLevel} = getIndentLevel(str, opts.indentChar, opts.indentCount));
      chunk = char;
      for ( let i=indentLevel * opts.indentCount; --i>=0; chunk += opts.indentChar);
      if( indentLevel <= opts.bufIndentLevel && str[0] != '\n') {
        str = chunk + str;
        chunk = '';
        break;
      }
      continue;
    }

    // Tag Container
    if ( char == opts.tagContainer[0] && (str[0] == opts.declarative || str[0] == opts.additive) ) {
      // Flush chunk
      buf.push(chunk);
      ( {str, tag} = parseTag(str, opts) );
      ( {str, buf: chunk} = parse(str, Object.assign({}, opts, {bufIndentLevel: indentLevel})) );
      tag.buf = chunk;
      tag.indent = '';
      for ( let i=indentLevel * opts.indentCount; --i>=0; tag.indent += opts.indentChar);
      buf.push(tag);
      chunk = '';
      continue;
    }

    // String
    if ( char == '\'' || char == '"' || char == '`' ) {
      ({str, content} = parseString(str, char));
      chunk += char + content + char;
      continue;
    }

    // Comment
    if ( char == '/' ) {
      // Block Comment
      if ( str[0] == '*' ) {
        str = str.slice(1);
        ({str, content} = parseBlockComment(str));
        chunk += '/*' + content + '*/';
        continue;
      }
      // Line Comment
      if ( str[0] == '/' ) {
        str = str.slice(1);
        ({str, content} = parseLineComment(str));
        chunk += '//' + content;
        continue;
      }
    }

    chunk += char;
  }
  if ( chunk.length ) buf.push(chunk);

  return {str, buf};
}


function transform (buf) {
  let ret = '';
  let chunkStr;
  for ( let chunk of buf ) {
    if ( typeof chunk === 'string' ) {
      ret += chunk;
      continue;
    }

    chunkStr = '';
    if ( chunk.type == 'text' ) {
      chunkStr = `US.createText(\`${chunk.value}\`)`;
    }
    if ( chunk.type == 'comment' ) {
      chunkStr = `US.createComment('${chunk.value.replace(/'/g, `\\'`)}')`;
    }
    if ( chunk.type == 'element' ) {
      chunkStr = `US.createElement('${chunk.selector}', ${chunk.props}, ($parent)=>{${transform(chunk.buf)}\n${chunk.indent}})`;
    }
    if ( chunk.type == 'class' ) {
      chunkStr = `${chunk.selector}.create(${chunk.props}, ($parent)=>{${transform(chunk.buf)}\n${chunk.indent}})`;
    }

    if ( chunk.method == 'additive' ) {
      chunkStr = `$parent.add(${chunkStr})`;
    }
    ret += chunkStr+';';
  }
  return ret;
}


function compile (str, opts={}) {
  let {buf} = parse(str, opts);
  return transform(buf);
}
