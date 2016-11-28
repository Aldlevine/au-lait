module.exports = class ParseError extends Error {
  constructor (msg, file, line, column, src) {
    let message = `${file || '(anonymous file)'}:${line}:${column}`;
    message += `\n${src.split('\n')[line-1]}`;
    message += `\n${Array(column).join(' ')}^`;
    message += `\nParseError: ${msg}`;

    super(message);
    this.name = '';
  }
}
