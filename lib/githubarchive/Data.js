var knex = require('knex');
var strftime = require('strftime');
var Q = require('q');
var aggregator = require('../aggregator');

var Data = {
  knex : undefined,
  schema : undefined
}

Data.init = function(config, schema){
  Data.knex = knex({
    dialect: 'mysql',
    connection : config.mysql,
    debug: false
  });
  Data.schema = schema;
}

Data.saveRows = function(rows){
  console.log('saving', rows.length, 'rows...');
  var promises = [];
  for(var i in rows){
    promises.push(_saveRow(rows[i]));
  }
  return Q.all(promises);
}

Data.lastScanTimeForRepository = function(repository_owner, repository_name){
  return Data.knex.table('github_events')
  .max('created_at')
  .where('repository_owner', '=', repository_owner)
  .where('repository_name', '=', repository_name)
  .then(function(rows){
    //if null, means we have not scanned that repository before.  return epoch
    return rows[0]['max(`created_at`)'] || strftime('%F %T', new Date(0));
  });
}


Data.lastTimeRepositoryAggregated = function (repository_owner, repository_name) {
  return Data.knex.table('github_events_aggregated')
  .max('end_time')
  .where('repository_owner', '=', repository_owner)
  .where('repository_name', '=', repository_name)
  .then(function(rows){
    //if null, means we have not aggregated that repository before.  return epoch
    return rows[0]['max(`end_time`)'] || strftime('%F %T', new Date(0));
  });
}

Data.aggregateRepository = function(repository_owner, repository_name) {
  //check when data was last aggregated
  return Data.lastTimeRepositoryAggregated(repository_owner, repository_name)
  .then(function(last_aggr_time){
    console.log('aggr events for', repository_owner, repository_name, 'starting from', last_aggr_time);
    Data.getEventsForRepositoryAfterTimestamp(repository_owner, repository_name, last_aggr_time)
    .then(function(events){
      // TODO 
      // getting events works, now you need to use the aggregator you required to generate a number of aggregations.  
      // use _aggregate
      
      debugger;

    });
  });
}

Data.getEventsForRepositoryAfterTimestamp = function (repository_owner, repository_name, start_time) {
  //ignore end_time right now, not needed.
  return Data.knex.table('github_events')
  .select()
  .where('repository_owner', '=', repository_owner)
  .where('repository_name', '=', repository_name)
  .where('created_at', '>', strftime('%F %T', new Date(start_time)));
}

Data.getDistinctRepositoryNames = function() {
  // select distinct 'first_name' from customers
  return Data.knex.table('github_events')
  .distinct('repository_owner', 'repository_name')
  .select()
  .then(function(rows) {
    //TODO take the rows and format them into a proper data structure for the api.
  });
}

/* PRIVATE */

_saveRow = function(row) {
  var saveable_obj = _formatRow(row);
  return Data.knex.table('github_events').insert(saveable_obj);
}


_aggregate = function (data) {
  // given data aggreagte by some possible periods and save the aggregated values.

  // only save aggregations that are complete.  ie, if you do not hit the end of the period, do not save!
  //save by using _saveAggregations
}

_saveAggregations = function (aggregations) {

}

_formatRow = function(row){
  //map an array of values to the schema to build a js object which can be saved in mysql.
  var saveable_obj = {};
  for(var i in Data.schema){
    saveable_obj[Data.schema[i]] = row.f[i].v;
  }
  return saveable_obj;
}

module.exports = Data;
