const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('restart')
		.setDescription(`DEV ONLY | Make bot restarting`)
        .setDefaultPermission(false),
	async execute(interaction, bot) {
		let emb = new MessageEmbed()
            .setColor(Config.Colors.Transparent)
            .setDescription(`\`\`\`\n 🔁 Restarting... \n\`\`\``);

        await interaction.reply({embeds: [emb], ephemeral: true});

        process.exit(0);
	}
};