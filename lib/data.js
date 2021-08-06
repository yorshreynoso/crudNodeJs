/**
 * Library fo storing and editing data
 *
*/

//Dependencies
var fs      = require('fs');
var path    = require('path');
const helpers = require('./helpers');

//container for the module (to be exported)
var lib = { };

//base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/'); // __dirname gets the location where we are right now, and the second parameter tells where is the data based on where we are at this moment

//write data to a file
lib.create = function( dir, file, data, callback) {
    //open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            //convert data to string
            var stringData = JSON.stringify(data);

            //write to file and close it
            fs.writeFile(fileDescriptor, stringData, err => {
                if(!err) {
                    fs.close(fileDescriptor, err => {
                        if(!err) {
                            callback(false); // es un callback true, pero mi callback imprime como si fuera false
                        } else {
                            callback('error closing new file');
                        }
                    });
                } else {
                    callback('error writing to new file');
                }
            })
        } else {
            callback('could not create new file, it may already exist');
        }
    });
}


//Read data from a file
lib.read = (dir, file, callback) => {
    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8', function (err, data) {

        if(!err && data) {

            var parsedData = helpers.parseJsonToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }
    });
}

// Update data inside a file
lib.update = (dir, file, data, callback) => {
    //open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err, fileDescriptor) => {
        if(!err && fileDescriptor) {
            // convert data to string
            var stringData = JSON.stringify(data);

            //truncate the file
            if(!err) { // if there is not error, close de file
                // write to the file and close it
                fs.writeFile(fileDescriptor, stringData, err  => {
                    if(!err) {
                        fs.close(fileDescriptor, err => {
                            if(!err) {
                                callback(false); // ya no hubo error;
                            } else {
                                callback('Error closing existing file');
                            }
                        });
                    }
                });
            } else {
                callback('Error truncating file');
            }
        } else {
            callback('could not open the file for updating, it may not exist yet');
        }
    });
}

//Delete a file
lib.delete = (dir, file, callback) => {
    //unlink the link
    fs.unlink(lib.baseDir + dir +'/'+file+'.json', (err) => {
        if(!err){
            callback(false);
        } else {
            callback('Error deleting file');
        }
    })
}

//export the module
module.exports = lib;
