/**
   Request handlers
*/

// Dependencies
const _data     = require('./data');
const helpers   = require('./helpers');

//Define a request router
var handlers = {};

// Users
handlers.users = (data, callback) => {
    var acceptableMethods = ['post', 'put', 'get', 'delete'];
    //console.log(acceptableMethods.indexOf(data.method) > -1); // true or false
    
    if(acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405);
    }
}

//container for the user submethods
handlers._users = { };

// users - post
// required data: firstName, lastname, phone, password, tosAgreement
// optional data:none
handlers._users.post = function(data, callback) {
    // check that all required fieds are filled out
    var firstName       = typeof(data.payload.firstName)    == 'string'  && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName        = typeof(data.payload.lastName)     == 'string'  && data.payload.lastName.trim().length > 0  ? data.payload.lastName.trim()  : false;
    var phone           = typeof(data.payload.phone)        == 'string'  && data.payload.phone.trim().length == 10   ? data.payload.phone.trim()     : false;
    var password        = typeof(data.payload.password)     == 'string'  && data.payload.password.trim().length > 0  ? data.payload.password.trim()  : false;
    var tosAgreement    = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true        ? true : false;

    if(firstName && lastName && phone && password && tosAgreement) {
        //make sure that the user doesnt already exist
        _data.read('users', phone, function(err, data) { // its supposed that here we have to make a consultant to a DB
            if(err) {
                var hashedPassword = helpers.hash(password);

                // Create the user object
                if(hashedPassword) {
                    var userObject = {
                        firstName,
                        lastName,
                        phone,
                        // password,
                        hashedPassword,
                        tosAgreement: true
                    }
                    //console.log(userObject);
                    //store the user
                    _data.create('users', phone, userObject, function(err) {
                        if(!err) {
                            callback(200, {'status': true, 'description': 'se creo el usuario correctamente'});
                        } else {
                            //console.log(err);
                            callback(500, {'Error': 'could not create the new user'} );
                        }
                    });

                } else {
                    callback(500, {'Error': 'could not has the user'});
                }


            } else {
                // user already exists
                callback(400, { "Error":  'A user with that phone number already exist'});
            }
        })
    } else {
        callback(400, {'Error': 'Missing required fields'} );
    }
};

// users - get
// require data: phone
// optional data: none
//@TODO Only let an authenticated users acces their object. Dont let them acces anyone else
handlers._users.get = function(data, callback) {
    //console.log(data);
    //check that the phone number is valid
    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    if(phone) {
        console.log('hola entra a phone');
        _data.read('users', phone, function(err, data) {
            if(!err && data) {
                // remove the hashed password from the user object before returning the request
                delete data.hashedPassword;
                callback(200, data);
            } else {
                callback(404, {'Error': 'something wrong'});
            }
        });
    } else {
        callback(400, {'error': 'missing required field'});
    }
};

// users - put
// required data: phone
// optional data: firstName, lastName, password (at least one must be specified)
// @TODO  only let an authenticated user update their own object. Dont let them update anyone else's
handlers._users.put = function(data, callback) {
    console.log(data);
    //check for the required files
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    console.log(phone);
    //check for the optional fields
    var firstName       = typeof(data.payload.firstName)    == 'string'  && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName        = typeof(data.payload.lastName)     == 'string'  && data.payload.lastName.trim().length > 0  ? data.payload.lastName.trim()  : false;
    var password        = typeof(data.payload.password)     == 'string'  && data.payload.password.trim().length > 0  ? data.payload.password.trim()  : false;

    //error if the phone is invalid
    if(phone) {
        if(firstName || lastName || password) {
            //look up the user
            _data.read('users', phone, function(err, userData){
                if(!err && userData) {
                    //update the field necessary
                    if(firstName) {
                        userData.firstName = firstName;
                    }
                    if(lastName) {
                        userData.lastName = lastName;
                    }
                    if(password) {
                        userData.password = password;
                    }
                    //storage de the new updates
                    _data.update('users', phone, userData, function(err) {
                        if(!err) {
                            callback(200);
                        } else {
                            callback(400, {'Error': 'could not update the user'});
                        }
                    });
                } 
                else {
                    callback(400, {'Error': 'The specified user does not exist'});
                }
            })
        }
        else {
            callback(400, {'Error': 'Missing field to update'})
        }
    }
    else {
        callback(400, {'Error' : 'Missing required field'});
    }
};

// users - delete
handlers._users.delete = function(data, callback) {

};

// handlers.user = function(data, callback) {
//     callback()
// }

//sample handlers
// handlers.sample = function(data, callback) {
//    // callback a http status code, and a payload object
//    callback(406, {'name' : 'sample handler'});
// }

// ping handler
handlers.ping = (data, callback) => {
   callback(200);
}

// Not found handler
handlers.notFound = (data, callback) => {
    console.log('handler.notFound');
   callback(404);
}

handlers.hello = (data, callback) => {
   callback(200, {'sayHi':'Hello world'});
}

module.exports = handlers;