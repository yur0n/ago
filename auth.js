import axios from 'axios';
import { User } from './db.js';

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default async function auth({ id, username }) {
  const waitTime = getRandomNumber(60, 120) * 60 * 1000 + 2 * 60 * 1000; // 1-2hours 2minutes
  const retry = 2 * 60 * 1000; // 2minutes

  while (true) {
		const config = {
			method: 'post',
			url: 'https://ago-api.hexacore.io/api/app-auth',
			data: { user_id: id, username },
		};

		try {
			const res = await axios(config)
			if (res.status == 200) {
				console.log(username, 'authed!')
				User.findOneAndUpdate({ id }, { token: res.data.token })
				await new Promise(res => setTimeout(res, waitTime));
			} else {
				console.log(username, 'ERROR in response: ');
				console.log(res.status, res.data)
				await new Promise(res => setTimeout(res, retry));
			}
		} catch (e) {
			console.log(username, 'ERROR fetching: ');
			console.log(e.response?.status, e.response?.data)
			await new Promise(res => setTimeout(res, retry));
		}
  }
}
