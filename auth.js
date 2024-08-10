import axios from 'axios';
import { User } from './db.js';

async function job(id) {
  const user = await User.findOne({ id });
	const username = user.username;
	const user_id = user.id;
	const config = {
		method: 'post',
		url: 'https://ago-api.hexacore.io/api/app-auth',
		data: { user_id, username },
	};
	let status;

	try {
		const res = await axios(config)
		if (res.status == 200) {
      console.log(user.username, 'authed!')
			user.token = res.data.token;
			await user.save();
      status = true;
    } else {
			console.log(user.username, 'ERROR in response: ');
      console.log(res.status, res.data)
      status = false;
    }
	} catch (e) {
		console.log(user.username, 'ERROR fetching: ');
		console.log(e.response?.status, e.response?.data)
    status = false;
	}

	return status;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default async function auth(id) {
  const waitTime = getRandomNumber(60, 120) * 60 * 1000 + 2 * 60 * 1000; // 1-2hours 2minutes
  const retry = 2 * 60 * 1000; // 2minutes

  while (true) {
    const status = await job(id);

    if (status) {
      await new Promise(res => setTimeout(res, waitTime));
    } else {
      await new Promise(res => setTimeout(res, retry));
    }
  }
}
