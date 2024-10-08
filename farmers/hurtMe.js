import { apiPost, apiGet } from '../api.js';

async function job(id, currLevel, levels, freeLevels, username) {
	let level = currLevel;
	for (let i = 0; i < freeLevels; i++) {
		const reward = level <= 1000 ? levels[level].boostedAgoReward : levels[1000].boostedAgoReward;
		const config = {
			url: 'https://hurt-me-please-server.hexacore.io/game/event',
			data: {  
				agoClaimed: reward, 
				boosted: true, 
				level: level, 
				transactionId: null, 
				type: "EndGameLevelEvent"
			},
			auth: id,
			id
		};

		const { status, error } = await apiPost(config)
		if (status) {
			console.log(username, 'hurtme', level, 'done!');
			level++;
			await new Promise(res => setTimeout(res, 2000));
		} else {
			if (error?.data?.error?.message == 'Session completed game levels count exceeded and reset time is not reached') {
				console.log(username, 'hurtMe:',  'not time yet');
			} else {
				console.log(username, 'hurtMe:',error);
			}
			return
		}
	}
}

export default async function playHurtMe({ id, username }) {
	const twoMins = 2 * 60 * 1000; // 2minutes
	const day = 24 * 60 * 60 * 1000

  while (true) {
		const res = await apiGet({ url: 'https://hurt-me-please-server.hexacore.io/game/start', auth: id, id });
		if (res.data) {
			const data = res.data;
			const freeLevels = data.gameConfig.freeSessionGameLevelsMaxCount;
			const completedLevels = data.playerState.sessionCompletedGameLevelsCount
			const currLevel = data.playerState.currentGameLevel + 1;
			const resetTime = data.playerState.sessionGameLevelsCountResetTimestamp * 1000;
			const levels = data.gameConfig.gameLevels;
			const waitTime = (resetTime - Date.now()) + twoMins

			if (completedLevels >= freeLevels) {
				await new Promise(res => setTimeout(res, waitTime));
			}
			await job(id, currLevel, levels, freeLevels, username);
		} else {
			console.log(username, 'hurtMe:', res.error)
			await new Promise(res => setTimeout(res, twoMins));
		}
  }
}