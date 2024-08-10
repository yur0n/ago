import daily from "./farmers/daily.js";
import playHurtMe from "./farmers/hurtMe.js";
import mineGames from "./farmers/games.js";
import miner from "./farmers/miner.js";
import auth from "./auth.js";
import { CronJob } from 'cron';
import { User } from "./db.js";

async function work(id) {
	auth(id)
	await new Promise(res => setTimeout(res, 10_000))
	miner(id);
	await new Promise(res => setTimeout(res, 30_000))
	// mineGames(id);
	// await new Promise(res => setTimeout(res, 30_000))
	// playHurtMe(id);
	// await new Promise(res => setTimeout(res, 30_000))
	// daily(id);
}

async function init() {
	const existingUsers = await User.find({});
	for (const user of existingUsers) {
		work(user.id);
		user.isNew = false;
		user.save();
		await new Promise(res => setTimeout(res, 10_000))
	}
}
init();

async function checkForNewUsers() {
  const newUsers = await User.find({ isNew: true });

  for (const user of newUsers) {
    work(user.id);
		user.isNew = false;
		user.save();
		await new Promise(res => setTimeout(res, 10_000))
  }
}

new CronJob('* */30 * * * *', checkForNewUsers, null, true, 'America/Los_Angeles');
