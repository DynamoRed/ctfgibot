const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setDefaultPermission(false)
		.setName('unmute')
		.setDescription(`MODS ONLY | Unmute a muted member`)
		.addUserOption(opt => opt.setName('target').setDescription('User you want to mute').setRequired(true)),
	async execute(interaction, bot) {
		const guildId = interaction.guild.id;
        let target = interaction.options.getUser('target');
		let gTarget = interaction.guild.members.cache.find(m => m.user.id == target.id);

		if(!gTarget.roles.cache.has(Config.Roles[guildId].MUTED)){
			return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`This user isn't muted !`)], ephemeral: true});
		}

		try {
			gTarget.roles.remove(Config.Roles[guildId].MUTED);

			let emb = new MessageEmbed()
            .setColor(Config.Colors.Green)
			.setDescription(`\`\`\`\n 🔊 User unmuted \n\`\`\`
			» ${target} unmuted by ${interaction.user}`);

			let logEmb = new MessageEmbed()
				.setColor(Config.Colors.Transparent)
				.setDescription(`\`\`\`\n 🔊 User unmuted \n\`\`\`
				» ${interaction.user} just unmute ${target} in ${interaction.channel}`);

			interaction.guild.channels.cache.get(Config.Channels[guildId].LOGS).send({embeds: [logEmb]});

			await interaction.reply({embeds: [emb]});
		} catch (e) {
			throw e;
		}
    }
};