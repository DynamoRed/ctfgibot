const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('submit')
		.addIntegerOption(opt => opt.setName('session_id').setDescription('Flag session ID').setRequired(true))
		.addStringOption(opt => opt.setName('flag').setDescription('Flag you want to submit').setRequired(true))
		.setDescription(`Submit a flag for a session`),
	async execute(interaction, bot) {
        const guildId = interaction.guild.id;
        if(interaction.member.roles.cache.has(Config.Roles[guildId].SEEKER)) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`This command is reserved for unregistered members`)], ephemeral: true});

    }
};