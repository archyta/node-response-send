
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
  beforeEach(function(done){
    var self = this;

    var app = server(function(req, res){
      res.send('<p>Hello</p>');
    });

    request(app)
    .get('/')
    .end(function(err, res){
      if (err) return done(err);
      self.res = res;
      done();
    })
  })

  it('should respond with HTML', function(){
    this.res.should.have.header('content-type', 'text/html');
  })
})