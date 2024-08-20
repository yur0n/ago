
import { User } from './db.js'
import { Bot } from "grammy";

const bot = new Bot(process.env.BOT);

bot.command("start", (ctx) => ctx.reply("Welcome!"));

bot.on("message", (ctx) => {
	const user = User.findOne({ id: ctx.chatId })
	if (!user) return ctx.reply('User not found')
	user.token = ctx.msg
	ctx.reply("Token saved!")
});

bot.start();