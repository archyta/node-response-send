
var http = require('http')
  , send = require('..')
  , server = http.createServer
  , request = require('supertest');

// #nodejsWTF?

http.ServerResponse.prototype.__defineGetter__('req', function(){
  return this.socket.parser.incoming;
});

// augment prototype

http.ServerResponse.prototype.send = send;

// tests

describe('res.send()', function(){
  it('should support HEAD', function(done){
    var app = server(function(req, res){
      res.send('Hello');
    });

    request(app)
    .head('/')
    .expect('')
    .expect('Content-Length', '5')
    .expect(200, done);
  })
})

describe('res.send(status)', function(){
  it('should respond the status code string', function(done){
    var app = server(function(req, res){
      res.send(201);
    });

    request(app)
    .get('/')
    .expect(201, 'Created', done);
  })
})

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

describe('res.send(status, string)', function(){
  it('should respond with html', function(done){
    var app = server(function(req, res){
      res.send(201, '<p>Created</p>');
    });

    request(app)
    .get('/')
    .expect('<p>Created</p>')
    .expect('Content-Type', 'text/html')
    .expect(201, done);
  })
})

describe('res.send(String)', function(){
  it('should respond with html', function(done){
    var app = server(function(req, res){
      res.send(new String('<p>Hello</p>'));
    });

    request(app)
    .get('/')
    .expect('<p>Hello</p>')
    .expect('Content-Length', '12')
    .expect('Content-Type', 'text/html')
    .expect(200, done);
  })
})