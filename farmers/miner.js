import { apiPost, apiGet } from '../api.js';
import { User } from '../db.js';

export default async function miner({ id, username }) {
	const waitTime =  60 * 60 * 1000 + 2 * 60 * 1000; // 24hours 2minutes
  const waitOneHour = 60 * 60 * 1000 // 1hour
  const retry = 2 * 60 * 1000; // 2minutes

  while (true) {
		const user = await User.findOne({ id });
		const res = await apiGet({ url: 'https://ago-api.hexacore.io/api/available-taps', auth: user.token });
		if (res.data) {
			const taps = res.data.available_taps;
			if (taps > 0) {
				const config = {
					url: 'https://ago-api.hexacore.io/api/mining-complete',
					data: { taps },
					auth: user.token
				};
				const { status, error } = await apiPost(config);
				if (status) {
					console.log(username, 'taps done!')
					await new Promise(res => setTimeout(res, waitTime));
				} else {
					console.log(username, ':');
					console.log(error);
					await new Promise(res => setTimeout(res, retry));
				}
			} else {
				await new Promise(res => setTimeout(res, waitOneHour));
			}
		} else {
			console.log(res.error)
			await new Promise(res => setTimeout(res, retry));
		}
  }
}
