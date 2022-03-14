const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const https = require('https');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription(`Registration of student in the CaptureTheESGI association`)
        .addStringOption(opt => opt.setName('name').setDescription("Your first and last name (Ex: 'John DOE')").setRequired(true))
        .addStringOption(opt => opt.setName('email').setDescription("Your MyGES email adress").setRequired(true))
        .addStringOption(opt => opt.setName('identifier').setDescription("Your HackTheBox account identifier (Can be found at https://app.hackthebox.com/profile/settings)").setRequired(true)),
	async execute(interaction, bot) {
        const guildId = interaction.guild.id;
        if(interaction.member.roles.cache.has(Config.Roles[guildId].SEEKER)) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`This command is reserved for unregistered members`)], ephemeral: true});

        const mygesMailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@myges.fr$/;
        const nameRegex = /^([\w]{3,})+\s+([\w\s]{3,})+$/i;

        https.get(`https://www.hackthebox.com/`, res => {
            let data = '';
			res.on('data', c => { data += c });

            res.on('end', async () => {
                if(res.statusCode != 200) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`HackTheBox servers seems down ! Please wait...`)], ephemeral: true});
            })
        })

        if(interaction.channel.id != Config.Channels[guildId].REGISTER) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`This command is not permitted in this channel !`)], ephemeral: true});

        let submitName = interaction.options.getString('name');
        let submitMail = interaction.options.getString('email').toLowerCase();
        let htbAccountIdentifier = interaction.options.getString('identifier');

        if(!submitName.match(nameRegex)) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Your name is not valid !`)], ephemeral: true});
        if(!submitMail.match(mygesMailRegex)) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Your MyGES email is not valid !`)], ephemeral: true});

        let firstName = submitName.split(' ')[0];
        let lastName = submitName.slice(firstName.length+1);
        submitName = firstName.charAt(0).toUpperCase() + firstName.toLowerCase().slice(1) + ' ' + lastName.toUpperCase();

        https.get(`https://www.hackthebox.com/api/users/identifier/${htbAccountIdentifier}`, res => {
            let data = '';
            res.on('data', c => { data += c });

            res.on('end', async () => {
                if(res.statusCode == 200){
                    let jsonData = JSON.parse(data);
                    if(!jsonData) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when recovering your data !`)], ephemeral: true});

                    bot.Database.query(`INSERT INTO members (discord_id, htb_token, email, name) VALUES (?, ?, ?, ?);`, [
                        interaction.user.id,
                        htbAccountIdentifier,
                        submitMail,
                        submitName,
                    ], async (err, result) => {
                        if (err){
                            await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when saving your data !`)], ephemeral: true});
                            throw err;
                        }

                        let emb = new MessageEmbed()
                            .setColor(Config.Colors.Transparent)
                            .setDescription(`\`\`\`\n ✅ Registration successful \n\`\`\`
                            » **HackTheBox Account:** [${jsonData.user_name}#${jsonData.user_id}](https://app.hackthebox.com/profile/${jsonData.user_id}) ${jsonData.vip || jsonData.dedivip ? ` - (⭐ VIP)` : ``}
                            » **HackTheBox Rank:** ${jsonData.rank}`);

                        await interaction.reply({embeds: [emb], ephemeral: true});

                        let logEmb = new MessageEmbed()
                            .setColor(Config.Colors.Transparent)
                            .setDescription(`\`\`\`\n 📝 New registration \n\`\`\`
                            » **Discord Account:** ${interaction.user}
                            » **Email:** ${submitMail}
                            » **Name:** ${submitName}

                            » **HackTheBox Account:** [${jsonData.user_name}#${jsonData.user_id}](https://app.hackthebox.com/profile/${jsonData.user_id}) ${jsonData.vip || jsonData.dedivip ? ` - (⭐ VIP)` : ``}
                            » **HackTheBox Rank:** ${jsonData.rank}`);

                        interaction.guild.channels.cache.get(Config.Channels[guildId].LOGS).send({embeds: [logEmb]});

                        let welcomeEmb = new MessageEmbed()
                            .setColor(Config.Colors.Transparent)
                            .setDescription(`\`\`\`\n 👀 New Member ! \n\`\`\`
                            » **Welcome on board** ${interaction.user}`);

                        interaction.guild.channels.cache.get(Config.Channels[guildId].GENERAL).send({embeds: [welcomeEmb]});

                        let seekerRole = interaction.guild.roles.cache.find(r => r.id === Config.Roles[guildId].SEEKER);
                        interaction.member.setNickname(submitName);
                        interaction.member.roles.add(seekerRole);
                    })
                } else return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Your HackTheBox account identifier is not valid !`)], ephemeral: true});
            })
        })
	}
};