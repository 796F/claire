var knex = require('knex');
var _ = require('underscore');

Data = {};

FIELDS_TO_KEEP = {
  Event : ['repository_id', 'repository_full_name', 'actory_id', 'actor_name', 'org_id', 'org_name', 'payload', 
  'created_at', 'type', 'public', 'id']

}

Data.insertEvent = function (ev) {
  //pull up nested values.  
  ev.repository_id = ev.repo.id;
  ev.repository_full_name = ev.repo.name;
  
  ev.actor_id = ev.actor.id;
  ev.actor_name = ev.actor.login;
  
  ev.org_id = ev.org.id;
  ev.org_name = ev.org.login;
  //convert the non-uniform payload to a string.  
  ev.payload = JSON.stringify(ev.payload);
  //convert ISO time to unix time.  
  ev.created_at = Date.parse(ev.created_at) * 0.001;
  
  knex('github_events').insert(_.pick(ev, FIELDS_TO_KEEP.Event));
}

module.exports = Data;
