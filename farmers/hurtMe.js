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
			console.log(username, ':');
			console.log(error);
			return false;
		}
	}
	return true;
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
			await new Promise(res => setTimeout(res, waitTime));
			const status = await job(id, currLevel, levels, freeLevels, username);
			if (!status) {
				await new Promise(res => setTimeout(res, twoMins));
			}
			
		} else {
			console.log(res.error)
			await new Promise(res => setTimeout(res, twoMins));
		}
  }
}