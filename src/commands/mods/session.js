const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setDefaultPermission(false)
		.setName('session')
		.setDescription(`MODS ONLY | Manage CTF sessions`)
        .addSubcommand(scmd => scmd
			.setName('new')
			.setDescription('Schedule a new session')
            .addStringOption(opt => opt.setName('name').setDescription('Session name').setRequired(true))
            .addStringOption(opt => opt.setName('start_at').setDescription('Session starting timestamp (Format: \'DAY/MONTH/YEAR HOUR:MINUTE\' )').setRequired(true))
            .addStringOption(opt => opt.setName('end_at').setDescription('Session ending timestamp (Format: \'DAY/MONTH/YEAR HOUR:MINUTE\' )').setRequired(true))
        )
        .addSubcommand(scmd => scmd
			.setName('remove')
			.setDescription('Remove a scheduled session')
            .addIntegerOption(opt => opt.setName('id').setDescription('Session ID').setRequired(true))
        )
        .addSubcommandGroup(grp => grp
			.setName('targets')
			.setDescription('Manage and get session targets')
            .addSubcommand(scmd => scmd
                .setName('add')
                .setDescription('Add a session target')
                .addIntegerOption(opt => opt.setName('session_id').setDescription('Session ID').setRequired(true))
                .addStringOption(opt => opt.setName('name').setDescription('Target name').setRequired(true))
                .addStringOption(opt => opt.setName('content').setDescription('Target content ( Ex: HTB{my_sup3r_fl4g} )').setRequired(true))
            )
            .addSubcommand(scmd => scmd
                .setName('remove')
                .setDescription('Remove a session target')
                .addIntegerOption(opt => opt.setName('session_id').setDescription('Session ID').setRequired(true))
                .addStringOption(opt => opt.setName('name').setDescription('Target name').setRequired(true))
            )
            .addSubcommand(scmd => scmd
                .setName('get')
                .setDescription('Get a session target content')
                .addIntegerOption(opt => opt.setName('session_id').setDescription('Session ID').setRequired(true))
                .addStringOption(opt => opt.setName('name').setDescription('Target name').setRequired(true))
            )
            .addSubcommand(scmd => scmd
                .setName('list')
                .setDescription('Get session targets')
                .addIntegerOption(opt => opt.setName('session_id').setDescription('Session ID').setRequired(true))
            )
        ),
	async execute(interaction, bot) {
        const scmd = interaction.options.getSubcommand();
        if(!scmd) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Invalid subcommand argument !`)], ephemeral: true});

        let sgcmd;
        try {
            sgcmd = interaction.options.getSubcommandGroup();
        } catch(err) {}

        if(sgcmd){
            switch(sgcmd){
                case "targets":
                    switch(scmd){
                        case "add":
                            break;
                        case "remove":
                            break;
                        case "get":
                            break;
                        case "list":
                            break;
                        default: return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Invalid subcommand argument !`)], ephemeral: true});
                    }
                    break;
                default: return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Invalid subcommand argument !`)], ephemeral: true});
            }
        } else {
            switch(scmd){
                case "new":
                    let name = interaction.options.getString('name');
                    let startAt = interaction.options.getString('start_at').split(" ");
                    let endAt = interaction.options.getString('end_at').split(" ");

                    try {
                        let startAtDate = startAt[0].split("/");
                        let startAtTime = startAt[1].split(":");
                        let endAtDate = endAt[0].split("/");
                        let endAtTime = endAt[1].split(":");

                        startAt = `${startAtDate[2]}-${startAtDate[1]}-${startAtDate[0]}T${startAtTime[0]}:${startAtTime[1]}:00.000Z`;
                        endAt = `${endAtDate[2]}-${endAtDate[1]}-${endAtDate[0]}T${endAtTime[0]}:${endAtTime[1]}:00.000Z`;

                        startAt = new Date(startAt);
                        endAt = new Date(endAt);
                    } catch(err) {
                        return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Invalid date format !`)], ephemeral: true});
                    }

                    if(name.length <= 4) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Too short name !`)], ephemeral: true});
                    if(startAt == "Invalid Date") return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Invalid starting date !`)], ephemeral: true});
                    if(endAt == "Invalid Date") return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Invalid ending date !`)], ephemeral: true});

                    bot.Database.query(`SELECT name FROM sessions WHERE name=?;`, [name], async (err, result) => {
                        if(err){
                            await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                            throw err;
                        }

                        if(result.length != 0) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`A session already have this name !`)], ephemeral: true});
                        bot.Database.query(`INSERT INTO sessions (name, end_at, start_at) VALUES (?, ?, ?);`, [name, endAt, startAt], async (err, result) => {
                            if(err){
                                await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when saving your data !`)], ephemeral: true});
                                throw err;
                            }

                            let emb = new MessageEmbed()
                                .setColor(Config.Colors.Transparent)
                                .setDescription(`\`\`\`\n ✅ Successfully created \n\`\`\`
                                » **New session:** \`ID: #${result.insertId}\` **${name}** _(Start <t:${startAt.getTime()/1000}:R>, End <t:${endAt.getTime()/1000}:R>)_`);

                            await interaction.reply({embeds: [emb], ephemeral: true});
                        })
                    })
                    break;
                case "remove":
                    let id = interaction.options.getInteger('id');

                    bot.Database.query(`SELECT name FROM sessions WHERE id=?;`, [id], async (err, firstResult) => {
                        if(err){
                            await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                            throw err;
                        }

                        if(firstResult.length == 0) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Invalid session id !`)], ephemeral: true});

                        bot.Database.query(`DELETE FROM sessions WHERE id=?;`, [id], async (err, result) => {
                            if(err){
                                await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when deleting your data !`)], ephemeral: true});
                                throw err;
                            }

                            let emb = new MessageEmbed()
                                .setColor(Config.Colors.Transparent)
                                .setDescription(`\`\`\`\n 🗑️ Successfully deleted\n\`\`\`
                                » **Deleted session:** \`ID: #${id}\` **${firstResult[0].name}**`);

                            await interaction.reply({embeds: [emb], ephemeral: true});
                        })
                    })
                    break;
                default: return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Invalid subcommand argument !`)], ephemeral: true});
            }
        }
    }
};