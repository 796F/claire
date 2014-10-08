var Github = require('github');
var Twitter = require('twitter');
var SO = require('stackoverflow');
var GithubArchive = require('githubarchive')

var config = require('./config.js');

GithubArchive.init(config);
GithubArchive.run();

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

// Twitter.init(config);
// Twitter.run();

// SO.init(config);
// SO.run();

GLOBAL.debug = function(){
  if(DEBUG) {
    console.log.apply(this, arguments);
  }
}

GLOBAL.DEBUG = config.debug;
