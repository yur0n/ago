import axios from "axios";
import { bot } from './bot.js'

export async function apiPost({ url, data, auth, id }) {
	const config = {
		method: 'post',
		url,
		data,
		headers: { "Authorization": auth }
	};
	let status = false;
	let error;
	try {
		const res = await axios(config)
		if (res.status == 200) {
      status = true;
    } else {
			error = {
				msg: `ERROR in response ${id}`,
				status: res.status,
				data: res.data
			}
    }
	} catch (e) {
		if (e.response?.data?.error == 'Unauthorized') {
			try {
				await bot.api.sendMessage(id, `Please, update Token for ${id}`)
			} catch (e) {}
		}
		error = {
			msg: `ERROR fetching ${id}`,
			status: e.response?.status,
			data: e.response?.data
		}
	}
	return { status, error };
}

export async function apiGet({ url, auth, id }) {
	const config = {
		method: 'get',
		url,
		headers: { "Authorization": auth }
	};
	let data;
	let error;
	try {
		const res = await axios(config)
		if (res.status == 200) {
			data = res.data
    } else {
			error = {
				msg: `ERROR in response ${id}`,
				status: res.status,
				data: res.data
			}
    }
	} catch (e) {
		if (e.response?.data?.error == 'Unauthorized') {
			try {
				await bot.api.sendMessage(id, `Please, update Token for ${id}`)
			} catch (e) {}
		}
		error = {
			msg: `ERROR fetching ${id}`,
			status: e.response?.status,
			data: e.response?.data
		}
	}
	return { data, error };
}