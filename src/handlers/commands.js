const fs = require('fs');

module.exports = (bot) => {	
	bot.handleCommands = async (commandFolders, path) => {
		bot.commandArray = [];
		for (folder of commandFolders) {
			const commandFiles = fs
				.readdirSync(`${path}/${folder}`)
				.filter((file) => file.endsWith('.js'));
			for (const file of commandFiles) {
				const command = require(`../commands/${folder}/${file}`);
				bot.Commands.set(command.data.name, command);
				bot.commandArray.push(command.data.toJSON());
			}
		}
	};
};