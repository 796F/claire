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

Github.init = function(config){
  //do nothing with config for now.  
}

Github.run = function(options) {
  //init
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
