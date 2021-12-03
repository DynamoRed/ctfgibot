require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql');                                  
const colours = require('colour');
const Config = require('../conf');
const { Client, Intents, Collection, MessageEmbed } = require('discord.js');

const bot = new Client({
	intents:[Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES],
	presence: {
		status: 'online',
		activity: { name: 'In Dev...', type: 'PLAYING' }
	}
});
const handlers = fs.readdirSync('./src/handlers').filter(file => file.endsWith('.js'));
const events = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
const commands = fs.readdirSync('./src/commands');

const database = mysql.createConnection({
	host: Config.MySQL.HOST,
	user: Config.MySQL.USER,
	port: Config.MySQL.PORT,
	database: Config.MySQL.DATABASE,
	password: process.env.DB_PSSWD,
});
database.connect(function(err) {
	if(err){
		console.log(`An error occurred when trying to connect to database (${Config.MySQL.USER}@${Config.MySQL.HOST}:${Config.MySQL.PORT}) !`.red.bold);
		throw err;
	}
	console.log(`Connected to database (${Config.MySQL.USER}@${Config.MySQL.HOST}:${Config.MySQL.PORT}) !`.green);
});
bot.Database = database;

bot.Commands = new Collection();
bot.Funcs = {};

bot.Funcs.getErrorEmbed = content => {
	let errorEmbed = new MessageEmbed() 
		.setColor(Config.Colors.Red)
		.setDescription(`\`\`\`\n${content}\n\`\`\``);
	return errorEmbed;
}

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason.stack || reason)
});

bot.on('ready', (...args) => require(`./events/ready.js`).execute(...args, bot));

(async () => {
	for (handler of handlers) require(`./handlers/${handler}`)(bot)

	bot.handleEvents(events, './src/events');
	bot.handleCommands(commands, './src/commands');
	bot.login(process.env.TOKEN);
})();