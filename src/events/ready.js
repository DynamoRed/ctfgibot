const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');

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

						await rest.put(
							Routes.applicationGuildCommands(bot.user.id, guild.id),
							{body: bot.commandArray});
					})

					bot.Funcs.writeLog(`Commands successfully registered`, 'success');
				}, 10);

				setTimeout(() => {
					const modsCommandFiles = fs.readdirSync(`./src/commands/mods`).filter((file) => file.endsWith('.js'));

					bot.guilds.cache.forEach(async guild => {
						const managerRole = guild.roles.cache.find(r => r.name == "Managers");

						if(managerRole){
							await guild.commands.fetch().then(col => { col.forEach(async guildCommand => {
								for(const file of modsCommandFiles){
									if(guildCommand.name == file.replace(".js", "")){
										const permissions = [{
											id: managerRole.id,
											type: 'ROLE',
											permission: true,
										}];

										await guildCommand.permissions.add({permissions});
									}
								}
							})})
						}
					})

					bot.Funcs.writeLog(`Successfully add permissions to commands`, 'success');

					setTimeout(() => { bot.Funcs.writeLog(`Bot start successfully`, 'header'); }, 10);
				}, 1000);
			} catch (err) {
				bot.Funcs.writeLog(`${err}`, 'error');
			}
		})();
	},
};