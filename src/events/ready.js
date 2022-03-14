const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = {
	name: 'ready',
	once: true,
	async execute(bot) {
		const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

		bot.Funcs.writeLog(`Registering Commands to Discord API`, 'title');

		(async () => {
			try {
				bot.Funcs.writeLog(`Loading 'slash' commands...`);

				setTimeout(() => {
					bot.guilds.cache.forEach(async guild => {
						bot.Funcs.writeLog(`Asking API for guild ${guild.id}`, 'log');

						await rest.put(Routes.applicationGuildCommands(bot.user.id, guild.id), {
							body: bot.commandArray,
						});
					})

					bot.Funcs.writeLog(`Commands successfully registered`, 'success');

					bot.Funcs.writeLog(`Bot start successfully`, 'header');
				}, 10);
			} catch (err) {
				bot.Funcs.writeLog(`${err}`, 'error');
			}
		})();
	},
};