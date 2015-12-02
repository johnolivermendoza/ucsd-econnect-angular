var mongoose = require('mongoose');


var InviteSchema = new mongoose.Schema({
	userId: String, //type: {mongoose.Schema.Types.ObjectId, ref: 'User'},
	inviterId: String, //type: mongoose.Schema.Types.ObjectId, ref: 'User',
	projectId: String, //type: mongoose.Schema.Types.ObjectId, ref: 'Project',
	createDate: {type: Date, required: true}

});


mongoose.model('Invite', InviteSchema);