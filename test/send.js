
var http = require('http')
  , send = require('..')
  , server = http.createServer
  , request = require('supertest');

// augment prototype

// #nodejsWTF?

http.ServerResponse.prototype.__defineGetter__('req', function(){
  return this.socket.parser.incoming;
});

http.ServerResponse.prototype.send = send;

describe('res.send(string)', function(){
  it('should respond with html', function(done){
    var app = server(function(req, res){
      res.send('<p>Hello</p>');
    });

    request(app)
    .get('/')
    .expect('<p>Hello</p>')
    .expect('Content-Length', '12')
    .expect('Content-Type', 'text/html')
    .expect(200, done);
  })
})