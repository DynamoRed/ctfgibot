require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql');
const colours = require('colour');
const Config = require('../conf');
const { Client, Intents, Collection, MessageEmbed } = require('discord.js');

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', reason.stack || reason)
});

const bot = new Client({
	intents:[Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	presence: {
		status: 'online',
		activity: { name: 'In Dev...', type: 'PLAYING' }
	}
});

const handlers = fs.readdirSync('./src/handlers').filter(file => file.endsWith('.js'));
const events = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
const commands = fs.readdirSync('./src/commands');

bot.Database = mysql.createPool({
	connectionLimit : 10,
	host: Config.MySQL.HOST,
	user: Config.MySQL.USER,
	port: Config.MySQL.PORT,
	database: Config.MySQL.DATABASE,
	password: process.env.DB_PSSWD,
    debug: false,
});

bot.Commands = new Collection();
bot.Funcs = {};

let logFilePath = `/home/dynamo/log/discord/bots/ctfgi/${new Date().toLocaleDateString("fr-FR").replaceAll('/', '-')}.log`;
let i = 0;

while(fs.existsSync(logFilePath)){
	i++;
	logFilePath = `/home/dynamo/log/discord/bots/ctfgi/${new Date().toLocaleDateString("fr-FR").replaceAll('/', '-')}_${i}.log`;
}

fs.writeFile(logFilePath, "", err => {
	if(err){
		console.log("An error occured when writing logs");
		throw err;
	}

	startBot();
})

bot.Funcs.writeLog = (log, type) => {
	if(!log) return;
	if(!fs.existsSync(logFilePath)) return;
	if(!type) type = "info";

	type = type.toLowerCase();

	let nowDate = new Date().toLocaleString("fr-FR", {hour12: false});
	let finalLog = `${nowDate} - [${type.toUpperCase()}] ${log}`;
	let consoleLog = `[${type.toUpperCase()}] ${log}`;
	if(type == "title" || type == "header"){
		finalLog = `${nowDate} - ${log}`;
		consoleLog = log;
	}

	fs.appendFile(logFilePath, finalLog+'\n', err => {
		if(!err){
			switch(type){
				case "error":
					console.log(`${consoleLog}`.red);
					break;
				case "log":
				case "warning":
					console.log(`${consoleLog}`.yellow);
					break;
				case "success":
					console.log(`${consoleLog}`.green);
					break;
				case "header":
					console.log(`\n##############################################`.white.bold);
					console.log(`${consoleLog}`.white.bold);
					console.log(`##############################################`.white.bold);
					break;
				case "title":
					console.log(`\n**********************************************`.cyan);
					console.log(`${consoleLog}`.cyan);
					console.log(`**********************************************\n`.cyan);
					break;
				default:
					console.log(`${consoleLog}`.grey);
			}
			return;
		}
		console.log("An error occured when saving logs");
		throw err;
	})
}

bot.Funcs.getErrorEmbed = content => {
	let errorEmbed = new MessageEmbed()
		.setColor(Config.Colors.Red)
		.setDescription(`\`\`\`\n${content}\n\`\`\``);
	return errorEmbed;
}

function startBot(){
	bot.Funcs.writeLog(`Starting app... (${logFilePath.split('/')[logFilePath.split('/').length-1]})`, 'header');

	bot.Database.query("SELECT * FROM members WHERE id = 0", function(err) {
		bot.Funcs.writeLog(`Database loading`, 'title');
		setTimeout(() => {
			bot.Funcs.writeLog(`Connecting to database... (${Config.MySQL.USER}@${Config.MySQL.HOST}:${Config.MySQL.PORT})`);

			if(err) return bot.Funcs.writeLog(`${err}`, 'error');

			bot.Funcs.writeLog(`Successfully connected to database !`, 'success');
		}, 10);
	});

	(async () => {
		for (handler of handlers) require(`./handlers/${handler}`)(bot)

		bot.handleCommands(commands, './src/commands');
		bot.handleEvents(events, './src/events');
		bot.login(process.env.TOKEN);
	})();
}