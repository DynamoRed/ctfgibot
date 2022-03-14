const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('clear')
		.addIntegerOption(opt => opt.setName('count').setDescription('Number of messages to delete').setRequired(true))
		.setDescription(`MODS ONLY | Clear message(s)`),
	async execute(interaction, bot) {
		if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`You do not have the necessary permissions for this command`)], ephemeral: true});

        const guildId = interaction.guild.id;
        let count = interaction.options.getInteger('count');

		let emb = new MessageEmbed()
            .setColor(Config.Colors.Green)
			.setDescription(`\`\`\`\n 🗑️ ${count} messages cleared \n\`\`\``);

        let logEmb = new MessageEmbed()
            .setColor(Config.Colors.Transparent)
			.setDescription(`\`\`\`\n 🗑️ Messages cleared \n\`\`\`
            » ${interaction.user} just removed **${count}** messages in ${interaction.channel}`);

        interaction.guild.channels.cache.get(Config.Channels[guildId].LOGS).send({embeds: [logEmb]});

        const fetched = await interaction.channel.messages.fetch({limit: count - 1});

		try {
			interaction.channel.bulkDelete(fetched);
		} catch (e) {
			return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`I don't have the necessary permissions!`)]});
		}

        await interaction.reply({embeds: [emb], ephemeral: true});
    }
};