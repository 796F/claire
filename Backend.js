var config = require('./config.js');
var restify = require('restify');
var API = require('./API').init(config);

var server = restify.createServer({
    name : config.backend.name
});

server.use(restify.queryParser());  //parses the query string, ie /repo/three.js
server.use(restify.bodyParser());   //turns requests into js objects automagically
server.use(restify.CORS());         //configures 'Cross-origin resource sharing'
 
server.listen(config.backend.port, backend.config.ip, function(){
    console.log('%s ws now listening on %s ', server.name , server.url);
});

server.get({ path : '/test' } , API.test);

server.post({ path : '/starfrequency'}, API.tweetVolume);

server.get({ path: '/.*'}, restify.serveStatic({
  directory: './public',
  default: 'index.html'
}));
