const Config = require('../../conf');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { Collection } = require('discord.js');

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
					bot.guilds.cache.forEach(async guild => {
						let fullPermissions = [];
						let restrictions = new Collection();

						restrictions.set("dev", [{
							id: "324956349353951232",
							type: 'USER',
							permission: true,
						}]);

						const managerRole = guild.roles.cache.find(r => r.id == Config.Roles[guild.id]?.MANAGER);
						if(managerRole){
							restrictions.set("mods", [{
								id: managerRole.id,
								type: 'ROLE',
								permission: true,
							}]);
						}

						restrictions.forEach(async (permissions,k) => {
							const restrictCommands = fs.readdirSync(`./src/commands/${k}`).filter((file) => file.endsWith('.js'));

							await guild.commands.fetch().then(col => { col.forEach(async guildCommand => {
								for(const command of restrictCommands){
									if(guildCommand.name == command.replace(".js", "")) await guildCommand.permissions.add({ permissions });
								}
							})})
						})
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