var Proxies = require('./proxies');
var config = require('./config.js');


// var githubArchiveStream = require('./lib/githubarchive');
// githubArchiveStream.init(config);
// githubArchiveStream.run();

// var newsletterStream = require('./lib/email');
// newsletterStream.init(config);
// newsletterStream.run();

// var ProxyFactory = require('nonproxy').init(config.github_auth)
// // var ProxyFactory = require('ec2factory').init(config.ec2)
var ProxyFactory = Proxies.torfactory.init(config.tor)
.then(function(ready_factory){
  debugger;
  //factory ready, start up
  // Github.run({
  //   db_connector: knex,
  //   proxy_factory: ready_factory,
  //   github_auth : config.github_auth
  // });
});
