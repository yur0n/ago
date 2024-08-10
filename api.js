import axios from "axios";

export async function apiPost({ url, data, auth }) {
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
				msg: 'ERROR in response: ',
				status: res.status,
				data: res.data
			}
    }
	} catch (e) {
		error = {
			msg: 'ERROR fetching',
			status: e.response?.status,
			data: e.response?.data
		}
	}
	return { status, error };
}

export async function apiGet({ url, auth }) {
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
				msg: 'ERROR in response: ',
				status: res.status,
				data: res.data
			}
    }
	} catch (e) {
		error = {
			msg: 'ERROR fetching',
			status: e.response?.status,
			data: e.response?.data
		}
	}
	return { data, error };
}