var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
module.exports = mongoose.model('User', new Schema({ 
	name: String,
	groups:Array,
	project:{
		isAdmin:Boolean,
		users:Array, //by _id
		projects:Array //object { trip:... destinations:... plan:.. activities:....
	},
	email: String,
	password: String, 
    tokenF:String,
    profile_id:String

}));