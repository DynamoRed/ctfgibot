const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

module.exports = {
	event: 'ready',
	once: true,
	async execute(bot) {
		console.log('Bot online !'.green);

		const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

		(async () => {
			try {
				console.log(`Rafraichissement des commandes '/' ...`.blue);
				
				bot.guilds.cache.forEach(async guild => {
					console.log(`Asking API for guild ${guild.id}`.red);
					
					await rest.put(Routes.applicationGuildCommands(bot.user.id, guild.id), {
						body: bot.commandArray,
					});
				})

				console.log(`Rafraichissement réussi`.green.bold);
			} catch (error) {
				console.log(`${error}`);
			}
		})();
	},
};