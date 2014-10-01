
var config = require('./config.js');
var Github = require('github');
var Twitter = require('twitter');
var SO = require('stackoverflow');
var knex = require('knex')(config.knex);

// var ProxyFactory = require('ec2factory').init(config.ec2)
var ProxyFactory = require('torfactory').init(config.tor)
.then(function(ready_factory){
  //factory ready, start up
  Github.run({
    db_connector: knex,
    proxy_factory: ready_factory,
    github_auth : config.github_auth
  });
});

Twitter.run({
  //store tweets from streaming api that we are interested in.
  db_connector: knex
});

SO.run({
  //periodically query so and look for updates to questions, new questions, etc.
  db_connector: knex
});

GLOBAL.debug = function(){
  if(DEBUG) {
    console.log.apply(this, arguments);
  }
}

GLOBAL.DEBUG = config.debug;
