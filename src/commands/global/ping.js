const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const https = require('https');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription(`Get Client and API latencies`),
	async execute(interaction, bot) {
		https.get(`https://www.hackthebox.com/`, res => {
			let data = '';
			res.on('data', c => { data += c });

            res.on('end', async () => {
				let emb = new MessageEmbed()
					.setColor(Config.Colors.Transparent)
					.setDescription(`\`\`\`\n ⏰ Latencies \n\`\`\`
					» **Client:** \`${Date.now() - interaction.createdTimestamp}ms\`
					» **API:** \`${Math.round(bot.ws.ping)}ms\`
					» **HackTheBox Servers:** \`${res.statusCode == 200 ? 'Online' : 'Offline'}\``);

				await interaction.reply({embeds: [emb]});
			})
        })
	}
};