import { apiPost, apiGet } from './api.js';
import { User } from './db.js';

export default async function getTapPass({ id, username }) {
	const oneMinute = 60 * 1000;
	const twoMins = 2 * 60 * 1000;
  const waitOneHour = 60 * 60 * 1000; // 1hour
	const waitFiveHours = 3 * 60 * 60 * 1000

  while (true) {
		const user = await User.findOne({ id });

		const res = await apiGet({ url: 'https://ago-api.hexacore.io/api/get-tap-passes', auth: user.token, id });
		if (res.data) {
			const available = res.data.for_ago_available;
			const activeTapPass = res.data.active_tap_pass;
			if (!available && !activeTapPass) {
				await new Promise(res => setTimeout(res, waitFiveHours));
				continue;
			}
			if (!activeTapPass) {
				const config = {
				url: 'https://ago-api.hexacore.io/api/buy-tap-passes',
				data: { name: "7_days" },
				auth: user.token,
				id
				};
				const tapPass = await apiPost(config);
				if (tapPass.error) {
					console.log(`${username}: TAP PASS ERROR:`);
					console.log(tapPass.error)
					await new Promise(res => setTimeout(res, waitOneHour));
				} else {
					console.log(`${username}: GOT TAP PASS`);
					await new Promise(res => setTimeout(res, oneMinute));
				}
			}
			const minerStatus = await miner(user, id);
		} else {
			console.log(`${username}: TAP PASS ERROR:`);
			console.log(res.error)
			await new Promise(res => setTimeout(res, waitOneHour));
		}
  }
}

async function miner(user, id) {
	  const retry = 2 * 60 * 1000; // 2minutes
	const res = await apiGet({ url: 'https://ago-api.hexacore.io/api/available-taps', auth: user.token, id });
		if (res.data) {
			const taps = res.data.available_taps;
			if (taps > 0) {
				const config = {
					url: 'https://ago-api.hexacore.io/api/mining-complete',
					data: { taps },
					auth: user.token,
					id
				};
				const { status, error } = await apiPost(config);
				if (status) {
					console.log(username, 'taps done!')
					return true;
				} else {
					console.log(username, ':');
					console.log(error);
					return false;
				}
			} else {
				return false;
			}
		} else {
			console.log(res.error)
			return false;
		}
}
