import { apiPost } from '../api.js';
import { User, HurtMeLevel } from '../db.js';

async function playGame(id) {
  const user = await User.findOne({ id });
  const hurtMeLevel = user.hurtMeLevel;
	const { reward } = await HurtMeLevel.find({ level: hurtMeLevel })
	const config = {
		url: 'https://hurt-me-please-server.hexacore.io/game/event',
		data: {  
			agoClaimed: reward, 
			boosted: true, 
			level: hurtMeLevel, 
			transactionId: null, 
			type: "EndGameLevelEvent"
		},
		auth: id
	};

	const res = await apiPost(config)
	if (res.status) {
		console.log(user.username, 'hurtme', hurtMeLevel, 'done!')
		user.hurtMeLevel = hurtMeLevel + 1;
		await user.save();
	} else {
		console.log(user.username, ':');
		console.log(res.error);
	}

	return res.status;
}

async function job(id) {
	let status = false;
	for (let i = 0; i < 5; i++) {
		const gameStatus = await playGame(id);
		if (gameStatus) {
			status = true;
		} else {
			return false;
		}
		await new Promise(res => setTimeout(res, 2000));
	}
	return status;
}

export default async function playHurtMe(id) {
  const waitTime = 3 * 60 * 60 * 1000 + 2 * 60 * 1000; // 3hours 2minutes
  const retry = 2 * 60 * 1000; // 2minutes
	const thirtyMins = 30 * 60 * 1000;

  while (true) {
    const status = await job(id);

    if (status) {
      await new Promise(res => setTimeout(res, waitTime));
    } else {
      await new Promise(res => setTimeout(res, thirtyMins));
    }
  }
}