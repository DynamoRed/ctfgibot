const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setDefaultPermission(false)
		.setName('kick')
		.setDescription(`MODS ONLY | Kick a member`)
		.addUserOption(opt => opt.setName('target').setDescription('User you want to kick').setRequired(true))
		.addStringOption(opt => opt.setName('reason').setDescription('Why you want to kick him')),
	async execute(interaction, bot) {
		const guildId = interaction.guild.id;
        let target = interaction.options.getUser('target');
        let reason = interaction.options.getString('reason');
		let gTarget = interaction.guild.members.cache.find(m => m.user.id == target.id);

		try {
			gTarget.kick(`${reason ? reason : ""}`);

			bot.Database.query(`INSERT INTO punishments (user_id, type, reason, punish_by) VALUES (?, "KICK", ?, ?);`, [target.id, reason || "No reason", interaction.user.id], async (err, result) => {
				if(err){
					await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when saving your data !`)], ephemeral: true});
					throw err;
				}

				let emb = new MessageEmbed()
					.setColor(Config.Colors.Green)
					.setDescription(`\`\`\`\n 👊 User kicked \n\`\`\`
					» ${target} kicked by ${interaction.user}`);

				let logEmb = new MessageEmbed()
					.setColor(Config.Colors.Transparent)
					.setDescription(`\`\`\`\n 👊 User kicked \n\`\`\`
					» ${interaction.user} just kick ${target} ${reason ? `for the reason: \`${reason}\`` : ''}`);

				interaction.guild.channels.cache.get(Config.Channels[guildId].LOGS).send({embeds: [logEmb]});

				await interaction.reply({embeds: [emb]});
			})
		} catch (e) {
			throw e;
		}
    }
};