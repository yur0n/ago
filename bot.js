
import { User } from './db.js'
import { Bot } from "grammy";

export const bot = new Bot(process.env.BOT);

bot.command("start", (ctx) => ctx.reply("Welcome!"));

bot.on("message", async (ctx) => {
	const token = ctx.msg.text
	const user = await User.findOne({ id: ctx.from.id })
	if (!user) return ctx.reply('User not found')
	user.token = token
	user.save()
	ctx.reply("Token saved!")
});

bot.start();