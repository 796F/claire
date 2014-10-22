var knex = require('knex');
// var strftime = require('strftime');
// var Q = require('q');

var Data = {
  knex : undefined
}

Data.init = function(config){
  Data.knex = knex({
    dialect: 'mysql',
    connection : config.mysql,
    debug: false
  });
  return Data;
}

