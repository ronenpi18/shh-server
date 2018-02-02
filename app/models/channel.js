var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('Channel', new Schema({
	name: String,
    Admin:Array, //User IDs
    logo_url:String,
	posts_id: Array,
	users:Array,
	state:Number
}));