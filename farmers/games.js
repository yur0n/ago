import { apiPost } from '../api.js';

async function playGame(user_id, game_id) {
	const config = {
		url: 'https://ago-api.hexacore.io/api/in-game-reward',
		data: { game_id, user_id },
		id: user_id
	};
	return apiPost(config);
}

async function job(id, username) {
	const games = [1,2,3,4,5]

	for (let i = 0; i < games.length; i++) {
		const { status, error } = await playGame(id, games[i]);
		if (!status) {
			console.log(username, ':');
			console.log(error);
			const lastTime = error.data?.last_reward;
			return { status: false, lastTime: lastTime }
		} else {
			console.log(username, 'game', i + 1, 'done!')
		}
		await new Promise(res => setTimeout(res, 2000));
	}
	return { status: true };
}

export default async function mineGames({ id, username }) {
  const waitTime = 12 * 60 * 60 * 1000 + 2 * 60 * 1000; // 12hours 2minutes
  const retry = 2 * 60 * 1000; // 2minutes
  while (true) {
    const { status, lastTime } = await job(id, username);

    if (status) {
      await new Promise(res => setTimeout(res, waitTime));
    } else {
			if (lastTime) {
				const awaitTime = waitTime - (Date.now() - lastTime * 1000);
				await new Promise(res => setTimeout(res, awaitTime));
			} else {
				await new Promise(res => setTimeout(res, retry));
			}
    }
  }
}

