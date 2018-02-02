var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Posts', new Schema({
	channel: String,
    Date:Array, //User ID
    views:Array
}));