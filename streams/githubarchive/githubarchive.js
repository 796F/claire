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
  _authorize().then(function(){
    _updateData(0);
  });
}

_authorize = function() {
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

_updateData = function(i) {
  var repository_owner = Archive.targets[i].owner;
  var repository_name = Archive.targets[i].repo;
  
  return _getLatestDataForRepository(repository_owner, repository_name)
  .then(function(totalRows){
    if(i+1 < Archive.targets.length) {
      return _updateData(i+1);
    }else{
      console.log('all scanned, delay for an hour then try again');
      return Q.delay(ONE_HOUR_IN_S).then(function(){
        return _updateData(0);
      })
    }
    
  }, _handleError, Data.saveRows);
}

_getLatestDataForRepository = function(repository_owner, repository_name){
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
        .then(_query, _queryError)
        .then(function(result){
          var jobId = result.jobReference.jobId;
          var pageToken = result.pageToken;

          //first page back.  if rows not empty, notify.  
          if(result.totalRows > 0 ){
            notify(result.rows);
          }
          //if more pages to go, paginate  
          if(pageToken){
            _paginate(jobId, pageToken, notify)
            .then(function(last_page){
              //end of data, resolve after last page is notified.  
              resolve(result.totalRows);
            });
          }else{
            resolve(result.totalRows);
          }
        });


      });
    });
}

function _refreshTokenError(err){
  console.log(err);
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
        if(result.totalRows == undefined) debugger;
        resolve(result);
      }
    });
  });
}

function _queryError(err){
  console.log('query error', err);
}

//calls nextPage in a loop on the dataset with next page token until we get all the data.  
_paginate = function(jobId, pageToken, notify) {
  return _nextPage(jobId, pageToken)
  .then(function(result){
    notify(result.rows);
    
    //if token, paginate again.  else finish promise chain with simple return.
    if(result.pageToken){
      return _paginate(jobId, result.pageToken, notify);
    }else{
      return result;
    }
  });
}

//requests a single page of our dataset using a page token.  
_nextPage = function(jobId, pageToken) {
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

_refreshAuth = function() {
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

function _handleError(err){
  throw err;
}

module.exports = Archive;
