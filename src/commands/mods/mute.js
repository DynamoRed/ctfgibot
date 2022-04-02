const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setDefaultPermission(false)
		.setName('mute')
		.setDescription(`MODS ONLY | Mute a member`)
		.addUserOption(opt => opt.setName('target').setDescription('User you want to mute').setRequired(true))
		.addStringOption(opt => opt.setName('reason').setDescription('Why you want to mute him')),
	async execute(interaction, bot) {
		const guildId = interaction.guild.id;
        let target = interaction.options.getUser('target');
        let reason = interaction.options.getString('reason');
		let gTarget = interaction.guild.members.cache.find(m => m.user.id == target.id);

		if(gTarget.roles.cache.has(Config.Roles[guildId].MUTED)){
			return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`This user is already muted !`)], ephemeral: true});
		}

		try {
			gTarget.roles.add(Config.Roles[guildId].MUTED, `${reason ? reason : ""}`);

			let emb = new MessageEmbed()
				.setColor(Config.Colors.Green)
				.setDescription(`\`\`\`\n 🔇User muted \n\`\`\`
				» ${target} muted by ${interaction.user}`);

			let logEmb = new MessageEmbed()
				.setColor(Config.Colors.Transparent)
				.setDescription(`\`\`\`\n 🔇User muted \n\`\`\`
				» ${interaction.user} just mute ${target} in ${interaction.channel} ${reason ? `for the reason: \`${reason}\`` : ''}`);

			interaction.guild.channels.cache.get(Config.Channels[guildId].LOGS).send({embeds: [logEmb]});

			await interaction.reply({embeds: [emb]});
		} catch (e) {
			throw e;
		}
    }
};