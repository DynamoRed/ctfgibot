module.exports = {
	name: 'interactionCreate',
	async execute(interaction, bot) {
		bot.Funcs.writeLog(`~ New interaction: ${interaction.user.tag} in #${interaction.channel.name}`);
		if (!interaction.isCommand()) return;

		const command = bot.Commands.get(interaction.commandName);
		if (!command) return;

		try {
			await command.execute(interaction, interaction.client);
		} catch (err) {
			console.log(`${err}`.red);
			await interaction.reply({
					content: `An error occurred. Please contact an Administrator !`,
					ephmeral: true
				}
			);
		}
	}
};