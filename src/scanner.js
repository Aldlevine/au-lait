const ParseError = require('./parse-error');
const {INDENT_CHAR} = require('./constants');

module.exports = class Scanner {
  constructor (str='', file, indentChar, indentCount) {
    this.str = str;
    this.file = file;
    this.indentChar = indentChar;
    this.indentCount = indentCount;
    this.index = -1;
  }

  error (msg) {
    let str = this.str.slice(0, this.index+1);
    let rows = str.split('\n');
    let row = rows.length;
    let col = rows[row-1].length;

    throw new ParseError(msg, this.file, row, col, this.str);
  }

  next () {
    return this.str[++this.index];
  }

  prev (count) {
    if ( count ) {
      for ( let i=1; i<count; i++ ) {
        this.prev();
      }
      return this.prev();
    }
    return this.str[--this.index];
  }

  nextTo (to) {
    let char;
    while ( (char = this.next()) != to );
  }

  prevTo (to) {
    let char;
    while ( (char = this.prev()) != to );
  }

  eatWhitespace () {
    let char;
    while ( (char = this.next()) == ' ' || char == '\t' || char == '\n' );
    this.prev();
  }

  peek () {
    return this.str.slice(this.index+1);
  }

  getIndentLevel () {
    let i = 0;
    let char;
    // Find all indent characters at beginning of line
    while ( (char = this.next()) == this.indentChar ) i++;
    // Make sure next char is not unused indent char
    for ( let key in INDENT_CHAR ) {
      if ( INDENT_CHAR[key] === this.indentChar ) continue;
      if ( char == INDENT_CHAR[key] ) this.error('Cannot mix TAB and SPACE characters in indents');
    }
    // Make sure the number of indentChars divides evenly by indentCount
    if ( i % this.indentCount != 0 ) {
      this.error('Uneven indent'); // TODO Better errors
    }
    this.prev();
    return i / this.indentCount;
  }
}
