var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('User', new Schema({ 
	name: String,
	email: String,
	password: String, 
    tokenF:String,
    profile_id:String,
	subsChannels: Array,
	myChannels:Array,
	img_url:String
}));