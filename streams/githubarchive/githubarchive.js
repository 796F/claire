var fs = require('fs');
var Q = require('q');
var vsprintf = require("sprintf-js").vsprintf;
var GAPI = require('googleapis');
var bq = GAPI.bigquery('v2');
var Data = require('./Data.js');

var COLUMNS = ['repository_url', 'repository_created_at', 'repository_description', 'repository_forks', 'repository_size',
'repository_name', 'repository_owner', 'repository_open_issues', 'repository_watchers', 'repository_pushed_at', 
'actor_attributes_login', 'actor_attributes_location', 'created_at', 'payload_commit_msg', 'url', 'type'];

var BASE_QUERY = 'SELECT ' + COLUMNS.join(', ') + ' FROM githubarchive:github.timeline ' + 
                 'WHERE repository_owner="%s" AND repository_name="%s" AND created_at > "%s" AND repository_fork="false" '+
                 'ORDER BY created_at ASC';

ONE_HOUR_IN_S = 60 * 60 * 1000;
ONE_MINUTE_IN_S = 60 * 1000;

Archive = {};

Archive.init = function(config) {
  var options = config.github_archive
  Archive.authClient = new GAPI.auth.JWT(options.iss, options.key_path, undefined, options.scope);
  Archive.projectId = options.projectId;
  Archive.targets = config.target_repos;
  Data.init(config, COLUMNS);
  return Archive;
}

Archive.run = function(options) {
  // Data.lastScanTimeForRepository('Famous', 'famous').then(console.log);
  // Data.aggregateRepository('Famous', 'famous').then(console.log);
  _authorize().then(function(){
    _updateData(0);
  }, _authError);
}

/* PRIVATE */

function _authorize () {
  return Q.Promise(function(resolve, reject, notify){
    Archive.authClient.authorize(function(err, tokens) {
      if (err) {
        reject(err);
      }else{
        console.log('got token', tokens.access_token);
        resolve(Archive);
      }
    });
  });
}

function _authError (err){
  console.log('auth err', err);
}

function _updateData (i) {
  var repository_owner = Archive.targets[i].owner;
  var repository_name = Archive.targets[i].repo;
  console.log('_updateData', repository_owner, repository_name);
  return _getLatestDataForRepository(repository_owner, repository_name)
  .then(function(totalRows){
    // if(totalRows > 0) Data.aggregateRepository(repository_owner, repository_name);

    if(i+1 < Archive.targets.length) {
      return _updateData(i+1);
    }else{
      console.log('all scanned, delay for an hour then try again');
      return Q.delay(ONE_HOUR_IN_S).then(function(){
        return _updateData(0);
      })
    }
    
  }, _latestDataError, Data.saveRows);
}

function _getLatestDataForRepository (repository_owner, repository_name){
  //refresh token, then try the request.  
  return Q.Promise(function(resolve, reject, notify){
    //get the last time we scanned this repo.  
    Data.lastScanTimeForRepository(repository_owner, repository_name)
    .then(function(last_scan_time){
      //get a good token for this request
        _refreshAuth()
        .then(function(){
          console.log('query for', repository_owner, repository_name, 'starting from', last_scan_time);
          return vsprintf(BASE_QUERY, [repository_owner, repository_name, last_scan_time]);
        }, _refreshTokenError)
        .then(_retriedQuery, _queryError)
        .then(function(result){
          var jobId = result.jobReference.jobId;
          var pageToken = result.pageToken;

          //first page back.  if rows not empty, notify.  
          if(result.totalRows > 0 ){
            notify(result.rows);
          }
          //if more pages to go, paginate  
          if(pageToken){
            console.log('paginating...')
            _paginate(jobId, pageToken, notify)
            .then(function(last_page){
              //end of data, resolve after last page is notified.  
              console.log('last page got', result.totalRows)
              resolve(result.totalRows);
            }, _paginateError);
          }else{
            resolve(result.totalRows);
          }
        });
      });
    });
}

function _refreshTokenError(err){
  console.log('refresh token error', err);
}

function _retriedQuery(query){
  return _query(query)
  .then(function(result){
    if(result.jobComplete){
      return result;
    }else{
      //incomplete job, most likely rate limited.  try again in a bit.  
      console.log('incomplete result, waiting a minute then _query');
      return Q.delay(ONE_MINUTE_IN_S).then(function(){
        return _retriedQuery(query);
      });
    }
  });
}

function _query(query){
  //execute a query on github archive, 
  return Q.Promise(function(resolve, reject, notify){
    var options = {
      auth: Archive.authClient,
      projectId: Archive.projectId,
      resource: { 
        kind: 'bigquery#queryRequest',
        query: query,
        maxResults: 1000,
        defaultDataset: {
          datasetId: 'scan' + Date.now()
        },
        useQueryCache: true 
      }
    };
    bq.jobs.query(options, function(err, result){
      if(err){
        reject(err)
      }else{
        console.log('got query result, complete:', result.jobComplete);
        resolve(result);
      }
    });
  });
}

function _queryError(err){
  console.log('query error', err);
}

//calls nextPage in a loop on the dataset with next page token until we get all the data.  
function _paginate (jobId, pageToken, notify) {
  console.log('paginate', arguments);
  return _nextPage(jobId, pageToken)
  .then(function(result){
    if(result.jobComplete){
      notify(result.rows);  
      //if token, paginate again.  else finish promise chain with simple return.
      if(result.pageToken){
        return _paginate(jobId, result.pageToken, notify);
      }else{
        return result;
      }
    }else{
      //get page request did not complete, probably because of rate limit
      return Q.delay(ONE_MINUTE_IN_S).then(function(){
        console.log('job did not complete, waiting a minute then _paginate');
        return _paginate(jobId, result.pageToken, notify);
      });
    }
  }, _nextPageError);
}

function _paginateError (err){
  console.log('paginate err', err);
}
//requests a single page of our dataset using a page token.  
function _nextPage (jobId, pageToken) {
  return Q.Promise(function(resolve, reject, notify){
    bq.jobs.getQueryResults({
      auth: Archive.authClient,
      jobId: jobId,
      pageToken: pageToken,
      maxResults: 1000,
      projectId: Archive.projectId,
      timeoutMs: 60000
    }, function(err, result){
      if(err){
        reject(err);
      }else{
        resolve(result);
      }
    });
  });
}

function _nextPageError (err){
  console.log('_nextPageError', err);
}

function _refreshAuth () {
  return Q.Promise(function(resolve, reject, notify){
    Archive.authClient.refreshToken_(undefined, function(err, result){
      if(err) {
        reject(err);
      }
      resolve(result);
    });
  });
}

function _handleResolve(totalRows){
  console.log('finished processing', totalRows, 'events');
}

function _latestDataError(err){
  console.log('_latestDataError', err);
}

module.exports = Archive;
