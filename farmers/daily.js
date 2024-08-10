import { apiPost, apiGet } from '../api.js';
import { User } from '../db.js';

async function job(user, day) {
  const token = user.token;
  const config = {
		url: 'https://ago-api.hexacore.io/api/daily-checkin',
		data: { day },
		auth: token
	};
  const res = await apiPost(config)
	if (res.status) {
    console.log(user.username, 'daily done!');
	} else {
    console.log(user.username, ':');
		console.log(res.error);
	}

	return res.status;
}

export default async function daily(id) {
  const waitTime =  60 * 60 * 1000 + 2 * 60 * 1000; // 24hours 2minutes
  const retry = 2 * 60 * 1000; // 2minutes

  while (true) {
		const user = await User.findOne({ id });
		const res = await apiGet({ url: 'https://ago-api.hexacore.io/api/daily-checkin', auth: user.token });
		if (res.data) {
			if (res.data.is_available) {
        const day = res.data.next
				const status = await job(user, day);
				if (status) {
					await new Promise(res => setTimeout(res, waitTime));
				} else {
					await new Promise(res => setTimeout(res, retry));
				}
			} else {
        const timeForDaily = res.data.available_at * 1000 - Date.now() + retry;
				await new Promise(res => setTimeout(res, timeForDaily));
			}
		} else {
			console.log(res.error)
			await new Promise(res => setTimeout(res, retry));
		}
  }
}