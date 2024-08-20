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
			auth: id,
			id
		};

		const { status, error } = await apiPost(config)
		if (status) {
			console.log(username, 'dirtyJob', level, 'done!');
			level++;
			await new Promise(res => setTimeout(res, 2000));
		} else {
			if (error?.data?.error?.message !== 'Session completed game levels count exceeded and reset time is not reached') {
				console.log(username, 'dirtyJob: ', 'Not time yet');
			} else {
				console.log(username, 'dirtyJob: ', error);
			}
			return
		}
	}
}

export default async function playDirtyJob({ id, username }) {
	const twoMins = 2 * 60 * 1000; // 2minutes
	const fiveMins = 5 * 60 * 1000

  while (true) {
		const res = await apiGet({ url: 'https://dirty-job-server.hexacore.io/game/start?playerId=' + id, auth: id, id });
		if (res.data) {
			const data = res.data;
			const freeLevels = data.gameConfig.freeSessionGameLevelsMaxCount;
			const currLevel = data.playerState.currentGameLevel + 1;
			const resetTime = data.playerState.sessionGameLevelsCountResetTimestamp * 1000;

			const waitTime = resetTime - (Date.now() + fiveMins)
			await job(id, currLevel, freeLevels, username);
			await new Promise(res => setTimeout(res, waitTime));
		} else {
			console.log(username, 'dirtyJob', res.error)
			await new Promise(res => setTimeout(res, twoMins));
		}
  }
}