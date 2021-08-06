/**
 *  Helpers for various tasks
*/

//dependencies
var crypto   = require('crypto');
var config  = require('./config');

//container for all the helpers
var helpers = {};


//create a SHA256  hash
helpers.hash = function(str) {
    if(typeof(str) == 'string' && str.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
}

//Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = function(str){
    console.log(typeof(str));
    try {
        var obj = JSON.parse(str)
        console.log(obj);
        return obj;
    } catch (err) {
        console.log('un catch');
        return {};
    }
}


module.exports = helpers;