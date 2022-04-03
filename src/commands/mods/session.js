const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');
const AsciiTable = require('ascii-table');

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
                .addStringOption(opt => opt.setName('points').setDescription('Target reward points').setRequired(true))
            )
            .addSubcommand(scmd => scmd
                .setName('remove')
                .setDescription('Remove a session target')
                .addIntegerOption(opt => opt.setName('target_id').setDescription('Target ID').setRequired(true))
            )
            .addSubcommand(scmd => scmd
                .setName('get')
                .setDescription('Get a session target content')
                .addIntegerOption(opt => opt.setName('target_id').setDescription('Target ID').setRequired(true))
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

        let sgcmd; try {
            sgcmd = interaction.options.getSubcommandGroup();
        } catch(err) {}

        if(sgcmd){
            switch(sgcmd){
                case "targets":
                    let sessionId;
                    let targetId;
                    switch(scmd){
                        case "add":
                            sessionId = interaction.options.getInteger('session_id');
                            let name = interaction.options.getString('name');
                            let content = interaction.options.getString('content');
                            let points = +(interaction.options.getString('points'));

                            if(name.length <= 3) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Target name is too short !`)], ephemeral: true});
                            if(content.length <= 0) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Target content is too short !`)], ephemeral: true});
                            if(!Number.isFinite(points) || points < 0.1 || points > 4) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Target reward points needs to be between 0.1 and 4 !`)], ephemeral: true});

                            bot.Database.query(`SELECT name FROM sessions WHERE id=?;`, [sessionId], async (err, sessionResult) => {
                                if(err){
                                    await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                                    throw err;
                                }

                                if(sessionResult.length == 0) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Invalid session id !`)], ephemeral: true});

                                bot.Database.query(`SELECT id FROM sessions_targets WHERE name=? OR content=?;`, [name, content], async (err, targetResult) => {
                                    if(err){
                                        await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                                        throw err;
                                    }

                                    if(targetResult.length != 0) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Target name and content needs to be unique !`)], ephemeral: true});

                                    bot.Database.query(`INSERT INTO sessions_targets (name, content, session_id, points) VALUES (?, ?, ?, ?);`, [name, content, sessionId, points], async (err, result) => {
                                        if(err){
                                            await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when saving your data !`)], ephemeral: true});
                                            throw err;
                                        }

                                        let emb = new MessageEmbed()
                                            .setColor(Config.Colors.Transparent)
                                            .setDescription(`\`\`\`\n ✅ Successfully added\n\`\`\`
                                            » **New target for session \`#${sessionId}\`:** \`ID: #${result.insertId}\` **${name}** _(${points} reward points)_`);

                                        await interaction.reply({embeds: [emb], ephemeral: true});
                                    })
                                })
                            })
                            break;
                        case "remove":
                            targetId = interaction.options.getInteger('target_id');

                            bot.Database.query(`SELECT content, name, session_id FROM sessions_targets WHERE id=?;`, [targetId], async (err, targetResult) => {
                                if(err){
                                    await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                                    throw err;
                                }

                                if(targetResult.length == 0) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Invalid target ID !`)], ephemeral: true});

                                bot.Database.query(`DELETE FROM sessions_targets WHERE id=?;`, [targetId], async (err, result) => {
                                    if(err){
                                        await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when deleting your data !`)], ephemeral: true});
                                        throw err;
                                    }

                                    let emb = new MessageEmbed()
                                        .setColor(Config.Colors.Transparent)
                                        .setDescription(`\`\`\`\n 🗑️ Successfully deleted\n\`\`\`
                                        » **Deleted target for session \`#${targetResult[0].session_id}\`:** \`ID: #${targetId}\` **${targetResult[0].name}**`);

                                    await interaction.reply({embeds: [emb], ephemeral: true});
                                })
                            })
                            break;
                        case "get":
                            targetId = interaction.options.getInteger('target_id');

                            bot.Database.query(`SELECT content, name FROM sessions_targets WHERE id=?;`, [targetId], async (err, result) => {
                                if(err){
                                    await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                                    throw err;
                                }

                                if(result.length == 0) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Invalid target ID !`)], ephemeral: true});

                                let emb = new MessageEmbed()
                                    .setColor(Config.Colors.Transparent)
                                    .setDescription(`\`\`\`\n 🚩 ${result[0].name} flag \n\`\`\`
                                    » **Content:** ||${result[0].content}||`);

                                await interaction.reply({embeds: [emb], ephemeral: true});
                            })
                            break;
                        case "list":
                            sessionId = interaction.options.getInteger('session_id');

                            bot.Database.query(`SELECT name FROM sessions WHERE id=?;`, [sessionId], async (err, sessionResult) => {
                                if(err){
                                    await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                                    throw err;
                                }

                                if(sessionResult.length == 0) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`Invalid session id !`)], ephemeral: true});

                                bot.Database.query(`SELECT id, name, points FROM sessions_targets WHERE session_id=?;`, [sessionId], async (err, result) => {
                                    if(err){
                                        await interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`An error occurred when retrieving data !`)], ephemeral: true});
                                        throw err;
                                    }

                                    if(result.length == 0) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`There is no targets for this session !`)], ephemeral: true});

                                    let flagsTable = new AsciiTable();
                                    flagsTable.setHeading('ID', 'Name', "Points");

                                    result.forEach(r => flagsTable.addRow("#"+r.id, r.name, r.points))

                                    flagsTable.removeBorder();
                                    flagsTable.setAlignCenter(2);

                                    let emb = new MessageEmbed()
                                        .setColor(Config.Colors.Transparent)
                                        .setDescription(`\`\`\`\n 🚩 ${sessionResult[0].name} flags \n\`\`\`
                                        \`\`\`\n${flagsTable.toString()}\n\`\`\``);

                                    await interaction.reply({embeds: [emb], ephemeral: true});
                                })
                            })
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

                        startAt = new Date(startAtDate[2], startAtDate[1]-1, startAtDate[0], startAtTime[0], startAtTime[1]);
                        endAt = new Date(endAtDate[2], endAtDate[1]-1, endAtDate[0], endAtTime[0], endAtTime[1]);
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