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
			// data: { user_id: id, username },
			data: {
				data: createUrlString({
					auth_data: Date.now().toString().slice(0,-3),
					hash : "933f2c3278bf3a123cf8fc4e7ec01e5af4727248c816972fe9f567abb4711d4f",
					query_id: "AAFhW0wDAwAAAGFbTAPHb962",
					user: {
						"id": 123123,
						"first_name":"Work",
						"last_name":"",
						"username":"usrname",
						"language_code":"en",
						"allows_write_to_pm": true
					}
				})
			}
		};

		try {
			const res = await axios(config)
			if (res.status == 200) {
				console.log(username, 'authed!')
				await User.findOneAndUpdate({ id }, { token: res.data.token })
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


function createUrlString(data) {
  // Extract the timestamp without the last 3 digits (assuming that's the intent)
  const authDate = Date.now().toString().slice(0, -3);

  // Encode the user object as a JSON string and URL-encode it
  const encodedUser = encodeURIComponent(JSON.stringify(data.user));

  // Construct the query string components
  const queryStringParts = [
    `query_id=${encodeURIComponent(data.query_id)}`,
    `user=${encodedUser}`,
    `auth_date=${authDate}`,
    `hash=${data.hash}`,
  ];

  // Join the components with '&' for URL encoding
  return queryStringParts.join('&');
}