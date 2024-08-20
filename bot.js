
import { User } from './db.js'
import { Bot } from "grammy";

export const bot = new Bot(process.env.BOT);

bot.command("start", (ctx) => ctx.reply("Welcome!"));

bot.on("message", (ctx) => {
	const [username, token] = ctx.msg.text.split(' ')
	const user = User.findOne({ username })
	if (!user) return ctx.reply('User not found')
	user.token = token
	user.save()
	ctx.reply("Token saved!")
});

bot.start();