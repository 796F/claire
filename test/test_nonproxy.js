var config = require('../config.js');
var nonproxy = require('../proxies/nonproxy');

exports.test_nonproxy = function(test){
  
  nonproxy.init(config.github_auth).then((function(ready_factory){
    var circ = ready_factory.getProxy();
    circ.get({
      protocol: 'https:',
      hostname: 'api.github.com',
      port: 443,
      headers: {'user-agent': 'node.js'},
      path: '/events'
    }).then((function(resp){
      test.equal(resp.length, 30);
      test.done();
    }).bind(test));
  }).bind(test));
}
