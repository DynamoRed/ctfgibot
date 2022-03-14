const Config = require('../../conf');
const { MessageEmbed } = require('discord.js');
const https = require('https');

module.exports = {
	name: 'guildMemberAdd',
	async execute(member, bot) {
		bot.Funcs.writeLog(`Member join: ${member.user.tag}`);

        member.roles.add(Config.Roles[member.guild.id].MEMBER);

        bot.Database.query(`SELECT discord_id, htb_token, name FROM members WHERE discord_id = ?;`, [member.user.id], async (err, sqlRes) => {
            if (err) throw err;

            if(sqlRes.length != 1){
                let logEmb = new MessageEmbed()
                    .setColor(Config.Colors.Green)
                    .setDescription(`\`\`\`\n 📥 New member \n\`\`\`
                    » <@${member.user.id}> just join our server`);

                member.guild.channels.cache.get(Config.Channels[member.guild.id].LOGS).send({embeds: [logEmb]});
            } else {
                let resultUser = sqlRes[0];

                https.get(`https://www.hackthebox.com/api/users/identifier/${resultUser.htb_token}`, res => {
                    let data = '';
                    res.on('data', c => { data += c });

                    res.on('end', async () => {
                        if(res.statusCode == 200){
                            let jsonData = JSON.parse(data);
                            if(!jsonData){
                                let logEmb = new MessageEmbed()
                                    .setColor(Config.Colors.Green)
                                    .setDescription(`\`\`\`\n 📥 New member \n\`\`\`
                                    » <@${member.user.id}> just join our server`);

                                member.guild.channels.cache.get(Config.Channels[member.guild.id].LOGS).send({embeds: [logEmb]});

                                return;
                            }

                            member.roles.add(Config.Roles[member.guild.id].SEEKER);
                            member.setNickname(resultUser.name);

                            let logEmb = new MessageEmbed()
                                .setColor(Config.Colors.Green)
                                .setDescription(`\`\`\`\n 📥 Member rejoin \n\`\`\`
                                » <@${member.user.id}> just rejoin our server`);

                            member.guild.channels.cache.get(Config.Channels[member.guild.id].LOGS).send({embeds: [logEmb]});
                        } else {
                            let logEmb = new MessageEmbed()
                                .setColor(Config.Colors.Green)
                                .setDescription(`\`\`\`\n 📥 New member \n\`\`\`
                                » <@${member.user.id}> just join our server`);

                            member.guild.channels.cache.get(Config.Channels[member.guild.id].LOGS).send({embeds: [logEmb]});
                        }
                    })
                })
            }
        })
	}
};