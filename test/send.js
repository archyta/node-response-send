
var http = require('http')
  , send = require('..')
  , server = http.createServer
  , request = require('supertest')
  , pending = require('./utils/pending');

// #nodejsWTF?

http.ServerResponse.prototype.__defineGetter__('req', function(){
  return this.socket.parser.incoming;
});

// augment prototype

http.ServerResponse.prototype.send = send;

// shared

function shared(fn) {
  it('should not override a previous Content-Type', function(done){
    var app = server(function(req, res){
      res.setHeader('Content-Type', 'image/png');
      fn(req, res);
    });

    request(app)
    .get('/')
    .expect('Content-Type', 'image/png')
    .end(done);
  })
}

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

  it('should add a weak ETag', function(done){
    done = pending(3, done);

    var app = server(function(req, res){
      switch (req.url) {
        case '/foo':
          return res.send(Array(1000).join('foo'));
        case '/bar':
          return res.send(Array(1000).join('bar'));
      }
    });

    request(app)
    .get('/foo')
    .expect('ETag', '601152967')
    .end(done);

    request(app)
    .get('/foo')
    .expect('ETag', '601152967')
    .end(done);

    request(app)
    .get('/bar')
    .expect('ETag', '-1124164645')
    .end(done);
  })

  it('should respond with 304 when ETag matches', function(done){
    done = pending(2, done);

    var app = server(function(req, res){
      return res.send(Array(1000).join('foo'));
    });

    request(app)
    .get('/foo')
    .expect('ETag', '601152967')
    .expect(200, done);

    request(app)
    .get('/foo')
    .set('If-None-Match', '601152967')
    .end(function(err, res){
      res.should.have.status(304);
      res.headers.should.not.have.property('content-length');
      res.headers.should.not.have.property('content-type');
      res.text.should.equal('');
      done();
    });
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

  shared(function(req, res){
    res.send(201);
  });
})

describe('res.send(Buffer)', function(){
  it('should respond with an octet-stream', function(done){
    var app = server(function(req, res){
      res.send(new Buffer('hey'));
    });

    request(app)
    .get('/')
    .expect('hey')
    .expect('Content-Length', '3')
    .expect('Content-Type', 'application/octet-stream')
    .expect(200, done);
  })

  shared(function(req, res){
    res.send(new Buffer('hey'));
  });
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

  it('should respond with byte-length', function(done){
    var app = server(function(req, res){
      res.send('…');
    });

    request(app)
    .get('/')
    .expect('…')
    .expect('Content-Length', '3')
    .expect(200, done);
  })

  shared(function(req, res){
    res.send('<p>Hello</p>');
  });
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

  shared(function(req, res){
    res.send(201, '<p>Created</p>');
  });
})

describe('res.send(string, status)', function(){
  it('should respond with html', function(done){
    var app = server(function(req, res){
      res.send('<p>Created</p>', 201);
    });

    request(app)
    .get('/')
    .expect('<p>Created</p>')
    .expect('Content-Type', 'text/html')
    .expect(201, done);
  })

  shared(function(req, res){
    res.send('<p>Created</p>', 201);
  });
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