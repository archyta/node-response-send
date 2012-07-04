
/**
 * Module dependencies.
 */

var crc = require('crc')
  , http = require('http');

/**
 * Send a response.
 *
 * Examples:
 *
 *     res.send(new Buffer('wahoo'));
 *     res.send({ some: 'json' });
 *     res.send('<p>some html</p>');
 *     res.send(404, 'Sorry, cant find that');
 *     res.send(404);
 *
 * @param {Mixed} body or status
 * @param {Mixed} body
 * @return {ServerResponse}
 * @api public
 */

module.exports = function(body){
  var req = this.req
    , head = 'HEAD' == req.method
    , len;

  // allow status / body
  if (2 == arguments.length) {
    // res.send(body, status) backwards compat
    if ('number' != typeof body && 'number' == typeof arguments[1]) {
      this.statusCode = arguments[1];
    } else {
      this.statusCode = body;
      body = arguments[1];
    }
  }

  // convert primitives
  body = body.valueOf();

  switch (typeof body) {
    // response status
    case 'number':
      if (!this.getHeader('Content-Type')) this.setHeader('Content-Type', 'text/plain');
      this.statusCode = body;
      body = http.STATUS_CODES[body];
      break;
    // string defaulting to html
    case 'string':
      if (!this.getHeader('Content-Type')) {
        this.charset = this.charset || 'utf-8';
        this.setHeader('Content-Type', 'text/html');
      }
      break;
    case 'boolean':
    case 'object':
      if (null == body) {
        body = '';
      } else if (Buffer.isBuffer(body)) {
        if (!this.getHeader('Content-Type')) this.setHeader('Content-Type', 'application/octet-stream');
      } else {
        return this.json(body);
      }
      break;
  }

  // populate Content-Length
  if (undefined !== body && !this.getHeader('Content-Length')) {
    this.setHeader('Content-Length', len = Buffer.isBuffer(body)
      ? body.length
      : Buffer.byteLength(body));
  }

  // ETag support
  // TODO: W/ support
  if (len > 1024) {
    if (!this.getHeader('ETag')) this.setHeader('ETag', Buffer.isBuffer(body)
      ? crc.buffer.crc32(body)
      : crc.crc32(body));
  }

  // freshness
  if (req.fresh) this.statusCode = 304;

  // strip irrelevant headers
  if (204 == this.statusCode || 304 == this.statusCode) {
    this.removeHeader('Content-Type');
    this.removeHeader('Content-Length');
    body = '';
  }

  // respond
  this.end(head ? null : body);
  return this;
};