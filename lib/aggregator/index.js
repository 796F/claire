Aggregator = {};

var S_PER_HOUR = 60 * 60;

var TIME_FIELD_NAMES = ['created_at', 'timestamp'];

Aggregator.frequency = {
  keyFormat : '',
  aggregationFunction : function(data, T) {
    if(data.length == 0) throw new Error('Data must have length > 0');

    var time_field    = timeFieldName(data),
        window_size   = T * S_PER_HOUR,
        start_time    = undefined, 
        curr_time     = undefined,
        counter       = 0,
        results       = [];

    for(var i=0; i<data.length; i++) {
      curr_time = data[i][time_field];
      
      if(start_time == undefined){
          start_time = curr_time;
      }else if(curr_time > start_time + window_size){
        //shift the window
        start_time += window_size;
        results.push(counter);
        counter = 0;
      }else if(i == data.length - 1) {
        //last element, push what you have.  
        results[key].push(counter);
        counter = 0;
      }
      counter++;
    }
  }
}

function timeFieldName (data){
  //check and return which time field name is in the object.
  for(var i=0; i<TIME_FIELD_NAMES.length; i++){
    if(data[0].hasOwnProperty(TIME_FIELD_NAMES[i])) return TIME_FIELD_NAMES[i];
  }
  throw new Error('Data Object must have time field');
}

module.exports = Aggregator;
