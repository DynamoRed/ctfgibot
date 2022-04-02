const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('export')
		.setDescription(`MODS ONLY | Export members list and their infos`),
	async execute(interaction, bot) {
		if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`You do not have the necessary permissions for this command`)], ephemeral: true});

        bot.Database.query(`SELECT members.id, name, email, (SELECT SUM(points) FROM sessions_targets_claims WHERE sessions_targets_claims.member_id = members.id) AS open_points FROM members ORDER BY name;`, async (err, result) => {
            if (err){
                await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                throw err;
            }

            if(result.length == 0){
                return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`No member can be retrieved from the database !\n(Surely because no one has open points)`)], ephemeral: true});
            }

            let resultIdx = 0;
            let infosStr = "NAME;EMAIL;POINTS\n;;";

            result.forEach(async sqlRes => {
                resultIdx++;

                infosStr += `\n${sqlRes.name.replace(";","_")};${sqlRes.email.replace(";","_")};${sqlRes.open_points > 0 ? sqlRes.open_points >= 4 ? 4 : sqlRes.open_points : 0}`;

                if(resultIdx == result.length) {
                    fs.writeFile('./temp.csv', infosStr, (err) => {
                        if(err) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occured when exporting data to CSV !`)], ephemeral: true});
                    });

                    let emb = new MessageEmbed()
                        .setColor(Config.Colors.Transparent)
                        .setDescription(`\`\`\`\n 📄 Exported Members informations \n\`\`\``);

                    await interaction.reply({embeds: [emb]});

                    const fileName = `export-${new Date().toLocaleDateString().replaceAll("/", "-")}.csv`;
                    interaction.channel.send({files: [{attachment: './temp.csv', name: fileName, description: 'Exported list of members and their informations'}]});
                }
            })
        })
    }
};