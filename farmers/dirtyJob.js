import { apiPost, apiGet } from '../api.js';

async function job(id, currLevel, freeLevels, username) {
	let level = currLevel;
	for (let i = 0; i < freeLevels; i++) {
		const config = {
			url: 'https://dirty-job-server.hexacore.io/game/end-game-level',
			data: {  
				boosted: true, 
				level: level,
				playerId: id, 
				transactionId: null, 
				type: "EndGameLevelEvent"
			},
			auth: id
		};

		const { status, error } = await apiPost(config)
		if (status) {
			console.log(username, 'dirtyJob', level, 'done!');
			level++;
			await new Promise(res => setTimeout(res, 2000));
		} else {
			if (error?.data?.error?.message !== 'Session completed game levels count exceeded and reset time is not reached') {
				console.log(username, 'dirtyJob', ':');
				console.log(error);
			} else {
				console.log(error);
			}
			return false
		}
	}
	return true;
}

export default async function playDirtyJob({ id, username }) {
	const twoMins = 2 * 60 * 1000; // 2minutes

  while (true) {
		const res = await apiGet({ url: 'https://dirty-job-server.hexacore.io/game/start?playerId=' + id, auth: id });
		if (res.data) {
			const data = res.data;
			const freeLevels = data.gameConfig.freeSessionGameLevelsMaxCount;
			const currLevel = data.playerState.currentGameLevel + 1;
			const resetTime = data.playerState.sessionGameLevelsCountResetTimestamp * 1000;

			const waitTime = resetTime - (Date.now() + twoMins)
			const jobDone = await job(id, currLevel, freeLevels, username);
			if (jobDone) {
				await new Promise(res => setTimeout(res, waitTime));
			} else {
				await new Promise(res => setTimeout(res, twoMins));
			}
		} else {
			console.log(res.error)
			await new Promise(res => setTimeout(res, twoMins));
		}
  }
}