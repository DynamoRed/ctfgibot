const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const https = require('https');
const AsciiTable = require('ascii-table');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('members')
		.setDescription(`MODS ONLY | List members and their infos`),
	async execute(interaction, bot) {
		if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`You do not have the necessary permissions for this command`)], ephemeral: true});

        https.get(`https://www.hackthebox.com/`, res => {
            let data = '';
			res.on('data', c => { data += c });

            res.on('end', async () => {
                if(res.statusCode != 200) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`HackTheBox servers seems down ! Please wait...`)], ephemeral: true});
            })
        })

        bot.Database.query(`SELECT members.id, name, htb_token, email, (SELECT SUM(points) FROM sessions_targets_claims WHERE sessions_targets_claims.member_id = members.id) AS open_points FROM members;`, async (err, result) => {
            if (err){
                await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                throw err;
            }

            let membersTable = new AsciiTable();
            membersTable.setHeading('Name', 'Open Points');

            let resultIdx = 0;

            if(result.length == 0){
                return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`No member can be retrieved from the database !\n(Surely because no one has open points)`)], ephemeral: true});
            }

            result.forEach(async sqlRes => {
                resultIdx++;

                membersTable.addRow(sqlRes.name, sqlRes.open_points > 0 ? sqlRes.open_points : 0);

                if(resultIdx == result.length) {
                    membersTable.sortColumn(1, (a, b) => { return b - a; });
                    membersTable.setJustify();
                    membersTable.removeBorder();
                    membersTable.setAlignCenter(1);

                    let emb = new MessageEmbed()
                        .setColor(Config.Colors.Transparent)
                        .setDescription(`\`\`\`\n 👥 Members informations \n\`\`\`
                        \`\`\`\n${membersTable.toString()}\n\`\`\``);

                    await interaction.reply({embeds: [emb]});
                }
            })
        })
    }
};