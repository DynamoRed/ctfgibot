const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('restart')
		.setDescription(`DEV ONLY | Make bot restarting`),
	async execute(interaction, bot) {
		if(interaction.user.id != "324956349353951232") return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`You do not have the necessary permissions for this command`)], ephemeral: true});

		let emb = new MessageEmbed()
            .setColor(Config.Colors.Transparent)
            .setDescription(`\`\`\`\n 🔁 Restarting... \n\`\`\``);

        await interaction.reply({embeds: [emb], ephemeral: true});

        process.exit(0);
	}
};