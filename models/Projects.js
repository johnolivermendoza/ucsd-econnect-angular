var mongoose = require('mongoose');


var ProjectSchema = new mongoose.Schema({
	name: String,
	description: String,
	teamDescription: String,
	skills: String,
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	creationDate: {type: Date, required: true},
	launchDate: {type: Date, required: true},
	users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	picName: String

});

/*
UserSchema.methods.setPassword = function(password){
	this.salt = crypto.randomBytes(16).toString('hex');

	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
}; */



mongoose.model('Project', ProjectSchema);