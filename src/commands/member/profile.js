const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const https = require('https');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription(`Get member profile`)
        .addUserOption(opt => opt.setName('user').setDescription('User whose profile you want to see')),
	async execute(interaction, bot) {
        const guildId = interaction.guild.id;
        if(!interaction.member.roles.cache.has(Config.Roles[guildId].SEEKER)) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`This command is reserved for our seekers`)], ephemeral: true});

        let user = interaction.options.getUser('user') || interaction.user;
        let userId = user.id;

        https.get(`https://www.hackthebox.com/`, res => {
            let data = '';
			res.on('data', c => { data += c });

            res.on('end', async () => {
                if(res.statusCode != 200) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`HackTheBox servers seems down ! Please wait...`)], ephemeral: true});
            })
        })

		bot.Database.query(`SELECT members.id, name, htb_token, email, (SELECT SUM(points) FROM sessions_targets_claims WHERE sessions_targets_claims.member_id = members.id) AS open_points FROM members WHERE discord_id = ?;`, [userId], async (err, sqlRes) => {
            if(err){
                await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                throw err;
            }

            if(sqlRes.length != 1) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Our database does not know this user`)], ephemeral: true});
            let resultUser = sqlRes[0];

            https.get(`https://www.hackthebox.com/api/users/identifier/${resultUser.htb_token}`, res => {
                let data = '';
                res.on('data', c => { data += c });

                res.on('end', async () => {
                    if(res.statusCode == 200){
                        let jsonData = JSON.parse(data);
                        if(!jsonData) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when recovering user data !`)], ephemeral: true});

                        let userRoles = "";
                        interaction.guild.members.cache.find(m => m.user.id == userId).roles.cache.forEach(r => { if(!r.name.includes("everyone")) userRoles += `<@&${r.id}> `; });

                        let emb = new MessageEmbed()
                            .setColor(Config.Colors.Transparent)
                            .setAuthor(user.tag + " profile", user.avatarURL())
                            .setDescription(`\`\`\`\n 🌍 Global Informations \n\`\`\`
                            » **Name:** ${user}
                            » **${resultUser.open_points > 0 ? resultUser.open_points : 0}** open points owned

                            \`\`\`\n ⚒️ Ranks \n\`\`\`
                            ${userRoles}

                            \`\`\`\n 📦 HackTheBox \n\`\`\`
                            » **Account:** [${jsonData.user_name}#${jsonData.user_id}](https://app.hackthebox.com/profile/${jsonData.user_id})
                            » **Rank:** ${jsonData.rank}
                            ${jsonData.hof_position == "unranked" ? `» Unranked` : `» **#${jsonData.hof_position}** world ranked`}
                            ${jsonData.vip || jsonData.dedivip ? `» ⭐ **VIP**` : ``}`);


                        if(interaction.user.id != userId) emb.setFooter(`Requested by ${interaction.user.tag}`, interaction.user.avatarURL());

                        await interaction.reply({embeds: [emb], ephemeral: true});
                    } else return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`The user HackTheBox account identifier is not valid !`)], ephemeral: true});
                })
            })
        })
	}
};