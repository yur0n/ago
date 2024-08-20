import { apiPost, apiGet } from './api.js';
import { User } from './db.js';

export default async function addStake({ id, username }) {
  const waitOneHour = 60 * 60 * 1000 // 1hour

  while (true) {
		const user = await User.findOne({ id });
		const res = await apiGet({ url: 'https://ago-api.hexacore.io/api/balance/' + id, auth: user.token, id });
		if (res.data) {
			const balance = res.data.balance;
			if (balance > 0) {
				const config = {
					url: 'https://ago-api.hexacore.io/api/staking/add-base',
					data: { amount: balance, type: "month" },
					auth: user.token,
					id
				};
				const stakeAdded = await apiPost(config);
				if (stakeAdded.status) {
					const stakes = await apiGet({ url: 'https://ago-api.hexacore.io/api/staking/active', auth: user.token, id });
					if (stakes.data) {
						if (!stakes.data.active_stakes?.length) {
							await new Promise(res => setTimeout(res, waitOneHour));
							continue;
						} 
						const stakeSum = stakes.data.active_stakes[0].base;
						const stakeProfit = stakes.data.active_stakes[0].revenue;
						const completeAt = new Date(stakes.data.active_stakes[0].complete_at * 1000).toLocaleString('en-US');
						console.log(`${username}: +${balance} to stake! Balance: ${stakeSum}, profit: ${stakeProfit}, complete at: ${completeAt}'`)
					}
					await new Promise(res => setTimeout(res, waitOneHour));
				} else {
					console.log(username, ':');
					console.log(stakeAdded.error);
					await new Promise(res => setTimeout(res, waitOneHour));
				}
			} else {
				await new Promise(res => setTimeout(res, waitOneHour));
			}
		} else {
			console.log(res.error)
			await new Promise(res => setTimeout(res, waitOneHour));
		}
  }
}
