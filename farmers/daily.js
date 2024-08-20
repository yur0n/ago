import { apiPost, apiGet } from '../api.js';
import { User } from '../db.js';

export default async function daily({ id, username }) {
  const waitTime =  60 * 60 * 1000 + 2 * 60 * 1000; // 24hours 2minutes
  const retry = 2 * 60 * 1000; // 2minutes

  while (true) {
		const user = await User.findOne({ id });
		const res = await apiGet({ url: 'https://ago-api.hexacore.io/api/daily-checkin', auth: user.token, id });
		if (res.data) {
			if (res.data.is_available) {
        const day = res.data.next
        const config = {
          url: 'https://ago-api.hexacore.io/api/daily-checkin',
          data: { day },
          auth: user.token,
					id
        };
				const { status, error } = await apiPost(config)
				if (status) {
          console.log(username, 'daily done!');
					await new Promise(res => setTimeout(res, waitTime));
				} else {
          console.log(username, ':');
          console.log(error);
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