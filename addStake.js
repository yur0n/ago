import { apiPost, apiGet } from './api.js';
import { User } from './db.js';

export default async function addStake({ id, username }) {
	const twoMins = 2 * 60 * 1000;
  const waitOneHour = 60 * 60 * 1000 // 1hour
	const waitThreeHours = 3 * 60 * 60 * 1000

  while (true) {
		const user = await User.findOne({ id });
		const res = await apiGet({ url: 'https://ago-api.hexacore.io/api/balance/' + id, auth: user.token, id });
		if (res.data) {
			const balance = res.data.balance;
			if (balance > 0) {
				const activeStakes = await apiGet({ url: 'https://ago-api.hexacore.io/api/staking/active', auth: user.token, id });
				if (activeStakes.data) {
					const activeStake = activeStakes.data.active_stakes[0]
					const completeAt = activeStake?.complete_at * 1000;
					if (Date.now() - completeAt < 1000) {
						const config = {
							url: 'https://ago-api.hexacore.io/api/staking/add-base',
							data: { type: "month" },
							auth: user.token,
							id
						};
						const stakeRestake = await apiPost(config);
						if (stakeRestake.status) {
							console.log(`${username}: STAKE BEEN RESTAKED`);
						} else {
							console.log(`${username}: ERROR RESTAKING STAKE: ${stakeRestake.error}`);
						}
						await new Promise(res => setTimeout(res, waitOneHour));
						continue;
					}
					if (activeStake?.active) {
						const total = activeStake.base + balance;
						const revenue = activeStake.revenue;

						const config = {
							url: 'https://ago-api.hexacore.io/api/staking/add-base',
							data: { amount: balance, type: "month" },
							auth: user.token,
							id
						};
						const stakeAdded = await apiPost(config);
						if (stakeAdded.status) {
							console.log(`${username}: +${balance} to stake! Balance: ${total}, profit: ${revenue}, complete at: ${completeAt}'`)
							await new Promise(res => setTimeout(res, waitThreeHours));
						} else {
							console.log(`${username}: ADD STAKE ERROR: ${stakeAdded.error}`);
							await new Promise(res => setTimeout(res, waitOneHour));
						}
					} else {
						const config = {
							url: 'https://ago-api.hexacore.io/api/staking/stake',
							data: { amount: balance, type: "month" },
							auth: user.token,
							id
						};
						const stakeCreated = await apiPost(config);
						if (stakeCreated.status) {
							console.log(`${username}: NEW STAKE CREATED`);
							await new Promise(res => setTimeout(res, twoMins));
						} else {
							console.log(`${username}: STAKE CREATE ERROR: ${stakeCreated.error}`);
							await new Promise(res => setTimeout(res, waitOneHour));
						}
					}
				} else {
					console.log(`${username}: ERROR getting info about stakes: ${activeStakes.error}`);
					await new Promise(res => setTimeout(res, waitOneHour));
				}

			} else {
				await new Promise(res => setTimeout(res, waitOneHour));
			}
		} else {
			console.log(`${username}: ERROR getting balance for stakes: ${activeStakes.error}`);
			await new Promise(res => setTimeout(res, waitOneHour));
		}
  }
}
