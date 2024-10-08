import daily from "./farmers/daily.js";
import playHurtMe from "./farmers/hurtMe.js";
import playDirtyJob from './farmers/dirtyJob.js'
import mineGames from "./farmers/games.js";
import miner from "./farmers/miner.js";
import auth from "./auth.js";
import addStake from './addStake.js'
import getTapPass from './getTapPass.js'
import { CronJob } from 'cron';
import { User } from "./db.js";
import './bot.js'

async function work(user) {
	// auth(user)
	// await new Promise(res => setTimeout(res, 5_000))
	getTapPass(user);
	await new Promise(res => setTimeout(res, 20_000))
	// miner(user);
	// await new Promise(res => setTimeout(res, 20_000))
	daily(user);
	await new Promise(res => setTimeout(res, 20_000))
	mineGames(user);
	await new Promise(res => setTimeout(res, 20_000))
	playHurtMe(user);
	await new Promise(res => setTimeout(res, 20_000))
	playDirtyJob(user);
	await new Promise(res => setTimeout(res, 60_000))
	addStake(user)
}

async function init() {
	const existingUsers = await User.find({});
	
	for (const user of existingUsers) {
		work(user);
		user.isNew = false;
		user.save();
		await new Promise(res => setTimeout(res, 10_000))
	}
}
init();

async function checkForNewUsers() {
  const newUsers = await User.find({ isNew: true });

  for (const user of newUsers) {
    work(user);
		user.isNew = false;
		user.save();
		await new Promise(res => setTimeout(res, 15_000))
  }
}

new CronJob('* */30 * * * *', checkForNewUsers, null, true, 'America/Los_Angeles');



// ADD: auto restake, auto create stake, auto hurt me init, auto lvl up;   CHNAGE: add stake from 1 hour to 3+ hours
