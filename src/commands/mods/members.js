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

        bot.Database.query(`SELECT members.id, name, htb_token, email, (SELECT SUM(points) FROM sessions_targets_claims WHERE sessions_targets_claims.member_id = members.id) AS open_points FROM members ORDER BY open_points DESC;`, async (err, result) => {
            if (err){
                await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                throw err;
            }

            let membersTable = new AsciiTable();
            membersTable.setHeading('Name', 'Open Points');

            if(result.length == 0){
                return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`No member can be retrieved from the database !\n(Surely because no one has open points)`)], ephemeral: true});
            }

            const perPage = 10;
            const pagesCount = Math.ceil(result.length/perPage);
            let actualPage = 1;
            let resultIdx = (actualPage-1)*perPage;

            result.forEach(async sqlRes => {
                resultIdx++;

                membersTable.addRow(sqlRes.name.length > 17 ? sqlRes.name.slice(0, 14) + "..." : sqlRes.name, sqlRes.open_points > 0 ? sqlRes.open_points : 0);

                if(resultIdx == perPage) {
                    membersTable.setJustify();
                    membersTable.removeBorder();
                    membersTable.setAlignCenter(1);

                    let emb = new MessageEmbed()
                        .setColor(Config.Colors.Transparent)
                        .setDescription(`\`\`\`\n 👥 Members informations \n\`\`\`
                        \`\`\`\n${membersTable.toString()}\n\`\`\``)
                        .setFooter(`Page ${actualPage}/${pagesCount}   (Navigation: ◀️ Previous | Next ▶️)`);

                    let replyMessage = await interaction.reply({embeds: [emb], fetchReply: true});

                    if(pagesCount > 1){
                        replyMessage.react('◀️').then(() => replyMessage.react('▶️'));

                        const filter = (reaction, user) => {
                            return (reaction.emoji.name === '◀️' || reaction.emoji.name === '▶️') && user.id == interaction.user.id;
                        };

                        const collector = replyMessage.createReactionCollector({filter, time: 30000});

                        collector.on("collect", (reaction, user) => {
                            reaction.users.remove(user);
                            membersTable.clear();
                            membersTable.setHeading('Name', 'Open Points');

                            switch(reaction.emoji.name){
                                case '◀️':
                                    if(actualPage <= 1) return;
                                    actualPage--;
                                    break;

                                case '▶️':
                                    if(actualPage >= pagesCount) return;
                                    actualPage++;
                                    break;

                                default:
                            }

                            bot.Database.query(`SELECT members.id, name, htb_token, email, (SELECT SUM(points) FROM sessions_targets_claims WHERE sessions_targets_claims.member_id = members.id) AS open_points FROM members ORDER BY open_points DESC LIMIT ${perPage} OFFSET ${perPage*(actualPage-1)};`, async (err, result) => {
                                if (err){
                                    await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                                    throw err;
                                }

                                if(result.length == 0){
                                    return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`No member can be retrieved from the database !\n(Surely because no one has open points)`)], ephemeral: true});
                                }

                                resultIdx = 0;
                                result.forEach(async sqlRes => {
                                    resultIdx++;

                                    membersTable.addRow(sqlRes.name.length > 17 ? sqlRes.name.slice(0, 14) + "..." : sqlRes.name, sqlRes.open_points > 0 ? sqlRes.open_points : 0);

                                    if(resultIdx == result.length) {
                                        membersTable.setJustify();
                                        membersTable.removeBorder();
                                        membersTable.setAlignCenter(1);

                                        emb = new MessageEmbed()
                                            .setColor(Config.Colors.Transparent)
                                            .setDescription(`\`\`\`\n 👥 Members informations \n\`\`\`
                                            \`\`\`\n${membersTable.toString()}\n\`\`\``)
                                            .setFooter(`Page ${actualPage}/${pagesCount}   (Navigation: ◀️ Previous | Next ▶️)`);

                                        replyMessage.edit({embeds: [emb]});
                                        collector.resetTimer();
                                    }
                                })
                            })
                        })

                        collector.on('end', () => {
                            replyMessage.reactions.removeAll();
                        })
                    }
                }
            })
        })
    }
};