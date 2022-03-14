const fs = require('fs');

module.exports = (bot) => {
	bot.handleCommands = async (commandFolders, path, callback) => {
		bot.Funcs.writeLog(`Handling commands`, 'title');

		bot.commandArray = [];
		for (folder of commandFolders) {
			bot.Funcs.writeLog(`Scanning '${folder}' folder`);
			const commandFiles = fs
				.readdirSync(`${path}/${folder}`)
				.filter((file) => file.endsWith('.js'));
			for (const file of commandFiles) {
				const command = require(`../commands/${folder}/${file}`);
				bot.Commands.set(command.data.name, command);
				bot.commandArray.push(command.data.toJSON());
				bot.Funcs.writeLog(`Found /${command.data.name}: ${file}`, 'log');
			}
		}
		if(callback && typeof(callback) == Function) callback();
	};
};