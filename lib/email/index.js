var Imap = require('imap');
var imap;

Email = {}

Email.init = function(config){
  //do nothing iwth init
  console.log('Email init');
  imap = new Imap(config.email);
}

Email.run = function(options){
  debugger;
  imap.once('ready', function() {
    debugger;
    
  });
  debugger;
}

module.exports = Email;
