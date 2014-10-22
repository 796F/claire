var DataStreams = require('./streams');
var Proxies = require('./proxies');
var config = require('./config.js');

for(var stream in DataStreams){
  DataStreams[stream].init(config);
  DataStreams[stream].run();
}

// var ProxyFactory = require('nonproxy').init(config.github_auth)
// // var ProxyFactory = require('ec2factory').init(config.ec2)
// // var ProxyFactory = require('torfactory').init(config.tor)
// .then(function(ready_factory){
//   //factory ready, start up
//   Github.run({
//     db_connector: knex,
//     proxy_factory: ready_factory,
//     github_auth : config.github_auth
//   });
// });

GLOBAL.debug = function(){
  if(DEBUG) {
    console.log.apply(this, arguments);
  }
}

GLOBAL.DEBUG = config.debug;
