const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('sessions')
		.setDescription(`Get CTF sessions (Upcomings, Past)`)
        .addStringOption(opt => opt
            .setName('timestamp')
            .setDescription('OPTIONAL | Sessions timestamp')
            .addChoices([['Scheduled','upcoming'], ['Actives','now'], ['Terminated', 'past']])),
	async execute(interaction, bot) {
        const guildId = interaction.guild.id;
        if(!interaction.member.roles.cache.has(Config.Roles[guildId].SEEKER)) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`This command is reserved for our seekers`)], ephemeral: true});

        let chosenTimestamp = interaction.options.getString('timestamp');

        let timestampQuery = `CURRENT_TIMESTAMP() < end_at`;
        if(chosenTimestamp){
            if(chosenTimestamp == "upcoming") timestampQuery = `CURRENT_TIMESTAMP() < start_at`;
            if(chosenTimestamp == "now") timestampQuery = `CURRENT_TIMESTAMP() >= start_at AND CURRENT_TIMESTAMP() <= end_at`;
            if(chosenTimestamp == "past") timestampQuery = `CURRENT_TIMESTAMP() > end_at LIMIT 7`;
        }

		bot.Database.query(`SELECT id, name, UNIX_TIMESTAMP(end_at) as end, UNIX_TIMESTAMP(start_at) as start FROM sessions WHERE ${timestampQuery};`, async (err, result) => {
            if(err){
                await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                throw err;
            }

            let resultIdx = 0;

            let upcomingsSessionsString = "\`\`\`\n ⌛ Upcomings Sessions \n\`\`\`";
            let pastsSessionsString = "\`\`\`\n 💤 Pasts Sessions \n\`\`\`";
            let activesSessionsString = "\`\`\`\n 🟢 Actives Sessions \n\`\`\`";

            let pastsSessions = [];
            let upcomingsSessions = [];
            let activesSessions = [];

            let now = Math.round(Date.now()/1000);

            let emb = new MessageEmbed()
                .setColor(Config.Colors.Transparent)
                .setDescription(`\`\`\`\n 🚩 CTF Sessions \n\`\`\`
                » **${result.length}** session${result.length > 1 ? 's' : ''} found in our database`);

            if(result.length == 0){
                if(!chosenTimestamp || chosenTimestamp == "now") activesSessionsString += `\n» **No session currently running**`;
                if(!chosenTimestamp || chosenTimestamp == "upcoming") upcomingsSessionsString += `\n» **No session scheduled**`;
                if(chosenTimestamp && chosenTimestamp == "past") pastsSessionsString += `\n» **No session terminated**`;

                if(!chosenTimestamp || chosenTimestamp == "now") emb.description += `\n\n${activesSessionsString}`;
                if(!chosenTimestamp || chosenTimestamp == "upcoming") emb.description += `\n\n${upcomingsSessionsString}`;
                if(chosenTimestamp && chosenTimestamp == "past") emb.description += `\n\n${pastsSessionsString}`;

                return interaction.reply({embeds: [emb], ephemeral: true});
            }

            result.forEach(async sqlRes => {
                resultIdx++;

                if(now >= sqlRes.start && now <= sqlRes.end) activesSessions.push(sqlRes);
                if(now > sqlRes.end) pastsSessions.push(sqlRes);
                if(now < sqlRes.start) upcomingsSessions.push(sqlRes);

                if(resultIdx == result.length){
                    if(activesSessions.length != 0) activesSessionsString += `\n» **${activesSessions.length} session${activesSessions.length > 1 ? 's' : ''} currently running**\n`;
                    activesSessions.forEach(session => {
                        activesSessionsString += `\n» (<:active:916093825137643580> Active) \`ID: #${session.id}\` **${session.name}** _(End <t:${session.end}:R>)_`;
                    })

                    if(upcomingsSessions.length != 0) upcomingsSessionsString += `\n» **${upcomingsSessions.length} scheduled session${upcomingsSessions.length > 1 ? 's' : ''}**\n`;
                    upcomingsSessions.forEach(session => {
                        upcomingsSessionsString += `\n» \`ID: #${session.id}\` **${session.name}** _(Start <t:${session.start}:R>)_`;
                    })

                    if(pastsSessions.length != 0) pastsSessionsString += `\n» **${pastsSessions.length} terminated session${pastsSessions.length > 1 ? 's' : ''}**\n`;
                    pastsSessions.forEach(session => {
                        pastsSessionsString += `\n» \`ID: #${session.id}\` **${session.name}** _(Ended <t:${session.end}:R>)_`;
                    })

                    if(activesSessions.length == 0) activesSessionsString += `\n» **No session currently running**`;
                    if(upcomingsSessions.length == 0) upcomingsSessionsString += `\n» **No session scheduled**`;
                    if(pastsSessions.length == 0) pastsSessionsString += `\n» **No session terminated**`;

                    if(!chosenTimestamp || chosenTimestamp == "now") emb.description += `\n\n${activesSessionsString}`;
                    if(upcomingsSessions.length != 0) emb.description += `\n\n${upcomingsSessionsString}`;
                    if(pastsSessions.length != 0) emb.description += `\n\n${pastsSessionsString}`;

                    await interaction.reply({embeds: [emb], ephemeral: true});
                }
            })
        })
	}
};