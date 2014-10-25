var imap = require('imap');

Newsletter = {}

Newsletter.init = function(config){
  //do nothing iwth init
  console.log('Newsletter init');
}

Newsletter.run = function(options){
  console.log('Newsletter run');
}

module.exports = Newsletter;
