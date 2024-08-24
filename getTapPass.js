import { apiPost, apiGet } from './api.js';
import { User } from './db.js';

export default async function getTapPass({ id, username }) {
	const twoMins = 2 * 60 * 1000;
  const waitOneHour = 60 * 60 * 1000; // 1hour

  while (true) {
		const user = await User.findOne({ id });
		const res = await apiGet({ url: 'https://ago-api.hexacore.io/api/get-tap-passes/', auth: user.token, id });
		if (res.data) {
			const activeTapPass = res.data.active_tap_pass;
			if (activeTapPass) {
				const expire = activeTapPass.expires_at * 1000;
				const waitTime = expire + twoMins - Date.now();
				await new Promise(res => setTimeout(res, waitTime));
			}
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
			}
		} else {
			console.log(`${username}: TAP PASS ERROR:`);
			console.log(res.error)
			await new Promise(res => setTimeout(res, waitOneHour));
		}
  }
}
