/*
  Module contains 
    custom Github API client library
    scraper routine
    Models for different types of data
    schema for database
    data layer for communication with db 
*/

Github = {};

var EventStream = require('./EventStream.js');
var Data = require('./Data.js');

Github.run = function(options) {
  //init database and proxy
  var db_connector = options.db_connector;
  var proxy_factory = options.proxy_factory;
  //initiate the event stream with the client information.
  EventStream.init(options.github_auth);
  //start the event listener, use it to drive everything else
  EventStream.pollEvents()
  .then(_resolve, _error, function(ev){
    //store the event
    console.log(JSON.stringify(ev));
    // Data.insertEvent(ev);
    //run the routine for specific type of event.  
    switch(ev.type){
      case 'WatchEvent':

        break;
      case 'CommitCommentEvent':
        // update relationship of user to a repo
        // record the body
        // commit comment event
        // who commented?
        // on what repository?
        // when comment happened
        // body of the comment
        // metadata surrounding user, repository

        break;
      case 'CreateEvent':
        // add a repo to the db
        // scan it to see if its something we're interested in.  
        // create event
        // who created 
        // what repository?
        // what time? 
        break;
      case 'DeleteEvent':
        // see if in our db.  
        // mark repo as inactive
        break;
      case 'FollowEvent':
        // update user network to reflect this
        // record the event
        break;
      case 'ForkEvent':
        // update relationship of user to a repo

        break;
      case 'IssuesEvent':
        // if repo is targeted, 
        // add an issue to the db
        break;

      case 'IssueCommentEvent':
        // update user relationship to a repo

        break;
      case 'PullRequestEvent':
        // if repo is targeted, add a PR to our db.  

        break;
      case 'PullRequestReviewCommentEvent':
        // update a user's relationship to a repository

        break;  
      case 'PushEvent':
        // console.log(ev.type);
        break;
      default:
        // console.log('IGNORE', ev.type);
        // no routine necessary for these events.
        // DeploymentEvent
        // DeploymentStatusEvent
        // DownloadEvent
        // GistEvent
        // GollumEvent
        // MemberEvent
        // PageBuildEvent
        // ReleaseEvent
        // ForkApplyEvent
        // PublicEvent
      break;
    }
  });
}

function _resolve(value){
  //this should never happen
  console.log('RESOLVED - EVENT STREAM PROMISE', value);
  throw new Error('RESOLVED - EVENT STREAM PROMISE', value);
}

function _error(err){
  console.log('ERROR - EVENT STREAM PROMISE', err);
  throw err;
}


module.exports = Github;
