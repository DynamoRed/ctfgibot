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
        if(!interaction.member.roles.cache.has(Config.Roles[guildId].SEEKER)) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`This command is reserved for our seekers`)], ephemeral: true});

		https.get(`https://www.hackthebox.com/`, res => {
            let data = '';
			res.on('data', c => { data += c });
            
            res.on('end', async () => {
                if(res.statusCode != 200) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`HackTheBox servers seems down ! Please wait...`)], ephemeral: true});
            })
        })

        let sessionId = interaction.options.getInteger('session_id');
        let submittedFlag = interaction.options.getString('flag').trim();

		bot.Database.query(`SELECT id FROM members WHERE discord_id = ${interaction.user.id};`, async (err, sqlRes) => {
            if (err){
                await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                throw err;
            }

            if(sqlRes.length != 1) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Seems like your not a valid seeker !`)], ephemeral: true});
            let resultUser = sqlRes[0];

			bot.Database.query(`SELECT name FROM sessions WHERE id = ${sessionId} AND CURRENT_TIMESTAMP() >= start_at AND CURRENT_TIMESTAMP() <= end_at;`, async (err, result) => {
				if (err){
					await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
					throw err;
				}
	
				if(result.length == 0) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Invalid session ID ! You can do \`/sessions\` to get a valid session ID`)], ephemeral: true});
				
				bot.Database.query(`SELECT id, name, points FROM sessions_targets WHERE session_id = ${sessionId} AND content = ${submittedFlag};`, async (err, result) => {
					if (err){
						await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
						throw err;
					}
		
					if(result.length != 1) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Whoops looks like you didn't find a valid flag for the session \`#${sessionId}\``)], ephemeral: true});

					const targetId = result[0].target_id;
					const targetPoints = result[0].points;

					bot.Database.query(`SELECT id FROM sessions_targets_claims WHERE target_id = ${targetId} AND member_id = ${resultUser.id};`, async (err, result) => {
						if (err){
							await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
							throw err;
						}
			
						if(result.length != 0) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`You can't submit this flag for the session \`#${sessionId}\` ! (Maybe cause you already submit it)`)], ephemeral: true});
						
						bot.Database.query(`SELECT id FROM sessions_targets WHERE session_id = ${sessionId};`, async (err, result) => {
							if (err){
								await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
								throw err;
							}
				
							const totalFlagsToFound = result.length;

							bot.Database.query(`INSERT INTO sessions_targets_claims (member_id, target_id, points) VALUES (?, ?, ?);`, [
								resultUser.id,
								targetId,
								targetPoints,
							], async (err, result) => {
								if (err){
									await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when saving your data !`)], ephemeral: true});
									throw err;
								}

								bot.Database.query(`SELECT id FROM sessions_targets_claims WHERE member_id = ${resultUser.id} AND target_id = (SELECT id FROM sessions_targets WHERE session_id = ${sessionId});`, async (err, result) => {
									if (err){
										await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
										throw err;
									}

									let emb = new MessageEmbed() 
										.setColor(Config.Colors.Transparent)
										.setDescription(`\`\`\`\n 👏 Congratulation ! \n\`\`\`
										» **Session:** \`#${sessionId}\`
										» **Flag:** ||${submittedFlag}||
										» You earned **${targetPoints} open points** !`);
									
									await interaction.reply({embeds: [emb], ephemeral: true});	

									let publicEmb = new MessageEmbed() 
										.setColor(Config.Colors.Transparent)
										.setDescription(`\`\`\`\n ✅ Valid flag submitted ! \n\`\`\`
										» **Session:** \`#${sessionId}\`
										» ${interaction.user} found ${result.length} of the ${totalFlagsToFound} flags`);
									
									await interaction.channel.send({embeds: [publicEmb]});	
								});														
							})
						})
					})
				})
			})
        })
    }
};