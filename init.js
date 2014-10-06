
var config = require('./config.js');
var Github = require('github');
var Twitter = require('twitter');
var SO = require('stackoverflow');
var knex = require('knex')(config.knex);
var GithubArchive = new (require('githubarchive'))(config.bigquery);

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

GithubArchive.run({ /* options go here */});

GithubArchive.authorize()
.then(function(ready_archive){
  // ready_archive.start();
  ready_archive.getLatestDataForRepository('Famous', 'famous', 0)
  .then(console.log, console.log, function(rows){
    console.log(rows.length);
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
