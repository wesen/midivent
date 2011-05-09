/**
 * BufferStream - helper class to stream data out of a buffer to
 * implement sysex parser a bit easier.
 **/
module.exports = function (buf) {
  this.buf = buf;
  this.idx = 0;
  this.length = this.buf.length;

  /**
   * Returns the number of bytes left in buffer stream.
   **/
  this.left = function () {
    return this.length - this.idx;
  };

  /**
   * Reset the stream to the beginning of the buffer.
   **/
  this.reset = function () {
    this.idx = 0;
  };

  /**
   * Go back by x (default 1) bytes.
   **/
  this.back = function (x) {
    x = x || 1;
    this.idx = Math.max(0, this.idx - x);
  };

  /**
   * Skip x (default 1) bytes.
   **/
  this.skip = function (x) {
    x = x || 1;
    this.idx = Math.min(this.length, this.idx + x);
  };

  /**
   * Return the next byte (x == undefined), or an array of the next x bytes. Returns undefined if there are no bytes left in the buffer.
   **/
  this.next = function (x) {
    if (x == undefined) {
      if (this.idx < this.length) {
        return this.buf[this.idx++];
      } else {
        return undefined;
      }
    } else {
      x = Math.min(this.buf.length - this.idx, x);
      if ((this.idx + x) <= this.length) {
        var res = this.buf.slice(this.idx, this.idx + x);
        this.idx += x;
        return res;
      } else {
        return undefined;
      }
    }
  };

  /**
   * Returns the next bytes until either the passed function is true, or the byte is equal to func_or_byte.
   **/
  this.until = function (func_or_byte) {
    var res = [];
    var f;

    if (typeof(func_or_byte) != 'function') {
      f = function (x) { return x === func_or_byte; };
    } else {
      f = func_or_byte;
    }

    var b;
    while ((b = this.next()) !== undefined) {
      if (f(b)) {
        break;
      } else {
        res.push(b);
      }
    }

    return res;
  };
};
