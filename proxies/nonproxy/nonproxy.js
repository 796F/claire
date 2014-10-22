/*
  fake proxy factory file, basically just normal https with the clientId and stuff.  
*/

NonProxy = {};

var https = require('https');
var Q = require('q');

NonProxy.init = function(options){
  NonProxy.client_id = options.client_id;
  NonProxy.client_secret = options.client_secret;
  return Q.Promise(function(resolve, reject, notify){
    resolve(NonProxy);
  });
}

Proxy = {
  get : function(options){
    options.path += '?client_id=' + NonProxy.client_id + '&client_secret=' + NonProxy.client_secret;
    console.log('OPTIONS, PATH', options.path);

    return Q.Promise(function(resolve, reject, notify){
      var req = https.request(options, function(res) {
        var data = '';
        var status = res.statusCode;
        var remaining = res.headers['x-ratelimit-remaining'];
        var reset_time = res.headers['x-ratelimit-reset'];

        res.on('data', function(chunk) {
          data += chunk;
        });

        res.on('end', function() {
          console.log(remaining, 'remaining, to reset at', reset_time);
          resolve(JSON.parse(data));
        });
      });
      
      req.on('error', function(error) {
        reject(error);
      });

      req.end();
    });
  }
}

NonProxy.getProxy = function () {
  return Proxy;
}

module.exports = NonProxy;
