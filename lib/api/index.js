var starfrequency = require('./starfrequency');
var Data = require('./Data.js');
var nj = require('nunjucks');
nj.configure('public', { autoescape: true });

API = {};

API.init = function (config) {
  API.Data = Data.init(config);
  return API;
}

API.starfrequency = function(req, res, next) {
  var period = req.params.period;
  var repository_owner = req.params.repository_owner;
  var repository_name = req.params.repository_name;
  if(repository_owner && repository_name){
    //single repo
  }else{
    //all repos
  }
}

API.test = function (req, res , next){
  // res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Content-Type','text/html; charset=utf-8');
  var renderOpts = { hello: 'world' };
  res.send(200, nj.render('index.html', renderOpts));
  return next();
}

API.tweetVolume = function (req, res , next){
  var period = req.params.period
  Data.getAllTweets()
  .then(function(tweets){ 
    var plottable_data = Aggregator.tweetFrequency(tweets, period);
    res.send(200, plottable_data);
    return next();
  });
}


module.exports = API;
