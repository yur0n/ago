import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/ago')

const userSchema = new mongoose.Schema({
	id: String,
	username: String,
	token: {
		type: String,
		default: 'token'
	},
	hurtMeLevel: {
		type: Number,
		default: 1
	},
	isNew: {
		type: Boolean,
		default: true
	}
});

const hurtMeLevelSchema = new mongoose.Schema({
	level: Number,
	reward: Number
});

const HurtMeLevel = mongoose.model('HurtMeLevel', hurtMeLevelSchema);
const User = mongoose.model('User', userSchema);

export { User, HurtMeLevel }