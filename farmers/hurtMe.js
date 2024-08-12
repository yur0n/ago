import { apiPost, apiGet } from '../api.js';

async function job(id, currLevel, levels, freeLevels, username) {
	let level = currLevel;
	for (let i = 0; i < freeLevels; i++) {
		const reward = levels[level].boostedAgoReward;
		const config = {
			url: 'https://hurt-me-please-server.hexacore.io/game/event',
			data: {  
				agoClaimed: reward, 
				boosted: true, 
				level: level, 
				transactionId: null, 
				type: "EndGameLevelEvent"
			},
			auth: id
		};

		const { status, error } = await apiPost(config)
		if (status) {
			console.log(username, 'hurtme', level, 'done!');
			level++;
			await new Promise(res => setTimeout(res, 2000));
		} else {
			if (error.data.message !== 'Session completed game levels count exceeded and reset time is not reached') {
				console.log(username, 'hurtMe',  ':');
				console.log(error);
			}
			return;
		}
	}
}

export default async function playHurtMe({ id, username }) {
	const twoMins = 2 * 60 * 1000; // 2minutes

  while (true) {
		const res = await apiGet({ url: 'https://hurt-me-please-server.hexacore.io/game/start', auth: id });
		if (res.data) {
			const data = res.data;
			const freeLevels = data.gameConfig.freeSessionGameLevelsMaxCount;
			const currLevel = data.playerState.currentGameLevel + 1;
			const resetTime = data.playerState.sessionGameLevelsCountResetTimestamp * 1000;
			const levels = data.gameConfig.gameLevels;

			const waitTime = resetTime - (Date.now() + twoMins)
			await job(id, currLevel, levels, freeLevels, username);
			await new Promise(res => setTimeout(res, waitTime));
			
		} else {
			console.log(res.error)
			await new Promise(res => setTimeout(res, twoMins));
		}
  }
}