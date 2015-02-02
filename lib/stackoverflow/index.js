var stackexchange = require('stackexchange');
var stackApi = new stackexchange({ version: 2.2 });

StackOverflow = {}

StackOverflow.init = function(config) {
  StackOverflow.filter = {
    key: config.stackexchange.key,
    pagesize: 100,
    tagged: 'famo.us',
    sort: 'activity',
    order: 'asc'
  };

  console.log('SO init');
}

StackOverflow.run = function(options){
  console.log('SO RUN');

  // Get all the questions (http://api.stackexchange.com/docs/questions)
  stackApi.questions.questions(StackOverflow.filter, function(err, results){
    if (err) throw err;
    else console.log('SO working')
  });
}

module.exports = StackOverflow;
