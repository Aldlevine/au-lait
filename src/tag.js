module.exports = class Tag {
  constructor ({type, declare, returns, value, content, tagname, id, classList, construct}={}) {
    this.type = type;
    this.declare = declare;
    this.returns = returns;
    this.value = value;
    this.content = content;
    this.tagname = tagname;
    this.id = id;
    this.classList = classList;
    this.construct = construct;
    this.indent = '';
  }
}
