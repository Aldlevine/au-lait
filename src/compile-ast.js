module.exports = compileAST;

function compileAST (content) {
  let ret = '';
  let chunkStr;
  let chunkContent;
  let chunkIndent;
  let ext;
  for ( let chunk of content ) {
    if ( typeof chunk === 'string' ) {
      ret += chunk;
      continue;
    }

    chunkStr = chunk.returns ? 'return ' : '';
    chunkStr += chunk.declare ? '$$.' : '$$parent.';
    if ( chunk.type == 'group' ) {
      chunkStr += `group(($$parent)=>{${compileAST(chunk.content)}\n${chunk.indent}})`;
    }
    else if ( chunk.type == 'element' ) {
      chunkContent = compileAST(chunk.content);
      chunkIndent = /\n/.test(chunkContent) ? `\n${chunk.indent}` : '';
      chunkStr += `element("${chunk.name}", "${chunk.id}", ${JSON.stringify(chunk.classList)}, ${chunk.value||'{}'}, ($$parent)=>{${chunkContent}${chunkIndent}})`;
    }
    else if ( chunk.type == 'text' || chunk.type == 'comment' || chunk.type == 'reference' ) {
      chunkStr += `${chunk.type}(${chunk.value})`;
    }
    else if ( chunk.type == 'construct' ) {
      chunkContent = compileAST(chunk.content);
      chunkIndent = /\n/.test(chunkContent) ? `\n${chunk.indent}` : '';
      chunkStr += `construct(${chunk.construct}, ${chunk.value||'{}'}, ($$parent)=>{${chunkContent}${chunkIndent}})`;
    }
    else if ( chunk.type == 'class' ) {
      ext = chunk.value.length ? ` extends ${chunk.value}` : '';
      chunkContent = compileAST(chunk.content);
      chunkIndent = /\n/.test(chunkContent) ? `\n${chunk.indent}` : '';
      chunkStr = `class ${chunk.name}${ext} {${chunkContent}${chunkIndent}}`;
    }
    else if ( chunk.type == 'function' ) {
      chunkContent = compileAST(chunk.content);
      chunkIndent = /\n/.test(chunkContent) ? `\n${chunk.indent}` : '';
      chunkStr = `${chunk.value}=>{return $$.group(($$parent)=>{${chunkContent}${chunkIndent}})}`;
    }
    else if ( chunk.type == 'member-function' ) {
      chunkContent = compileAST(chunk.content);
      chunkIndent = /\n/.test(chunkContent) ? `\n${chunk.indent}` : '';
      chunkStr = `${chunk.name} ${chunk.value} {return $$.group(($$parent)=>{${chunkContent}${chunkIndent}})}`;
    }

    ret += chunkStr;
  }
  return ret;
}
