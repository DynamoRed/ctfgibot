module.exports = {
	name: 'interactionCreate',
	async execute(interaction, bot) {
		console.log(`~ New interaction: ${interaction.user.tag} in #${interaction.channel.name}`.yellow.italic);
		if (!interaction.isCommand()) return;

		const command = bot.Commands.get(interaction.commandName);
		if (!command) return;

		try {
			await command.execute(interaction, interaction.client);
		} catch (error) {
			console.log(`${error}`);
			await interaction.reply(
				{
					content: `An error occurred. Please contact an Administrator !`,
					ephmeral: true
				}
			);
		}
	}
};