import { apiPost } from '../api.js';
import { User } from '../db.js';

async function playGame(user, game_id) {
  const user_id = user.id;
  const token = user.token;
	const config = {
		url: 'https://ago-api.onrender.com/api/in-game-reward',
		data: { game_id, user_id },
		auth: token
	};
	return apiPost(config);
}

async function job(id) {
	const user = await User.findOne({ id });
	const games = [1,2,3,4,5]

	for (let i = 0; i < games.length; i++) {
		const { status, error } = await playGame(user, games[i]);
		if (!status) {
			console.log(user.username, ':');
			console.log(error);
			const lastTime = error.data?.last_reward;
			return { status: false, lastTime: lastTime }
		} else {
			console.log(user.username, 'game', i + 1, 'done!')
		}
		await new Promise(res => setTimeout(res, 2000));
	}
	return { status: true };
}

export default async function mineGames({ id }) {
  const waitTime = 12 * 60 * 60 * 1000 + 2 * 60 * 1000; // 12hours 2minutes
  const retry = 2 * 60 * 1000; // 2minutes
  while (true) {
    const { status, lastTime } = await job(id);

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

