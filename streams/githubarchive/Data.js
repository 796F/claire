var knex = require('knex');
var strftime = require('strftime');
var Q = require('q');

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

/* PRIVATE */

_saveRow = function(row) {
  var saveable_obj = _formatRow(row);
  return Data.knex.table('github_events').insert(saveable_obj);
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
