import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/ago')

const userSchema = new mongoose.Schema({
	id: String,
	username: String,
	token: {
		type: String,
		default: 'token'
	},
	isNew: {
		type: Boolean,
		default: true
	}
});

const User = mongoose.model('User', userSchema);

export { User }