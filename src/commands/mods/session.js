const Config = require('../../../conf');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('session')
		.setDescription(`MODS ONLY | Manage CTF sessions`)
        .addSubcommand(scmd => scmd
			.setName('new')
			.setDescription('Schedule a new session')
            .addStringOption(opt => opt.setName('session_name').setDescription('Session name').setRequired(true))
            .addStringOption(opt => opt.setName('session_start_at').setDescription('Session starting timestamp (Format: \'DAY/MONTH/YEAR HOUR:MINUTE\' )').setRequired(true))
            .addStringOption(opt => opt.setName('session_end_at').setDescription('Session ending timestamp (Format: \'DAY/MONTH/YEAR HOUR:MINUTE\' )').setRequired(true))
        )
        .addSubcommand(scmd => scmd
			.setName('remove')
			.setDescription('Remove a scheduled session')
            .addIntegerOption(opt => opt.setName('session_id').setDescription('Session ID').setRequired(true))
        )
        .addSubcommandGroup(grp => grp
			.setName('targets')
			.setDescription('Manage and get session targets')
            .addSubcommand(scmd => scmd
                .setName('add')
                .setDescription('Add a session target')
                .addIntegerOption(opt => opt.setName('session_id').setDescription('Session ID').setRequired(true))
                .addStringOption(opt => opt.setName('target_name').setDescription('Target name').setRequired(true))
                .addStringOption(opt => opt.setName('target_content').setDescription('Target content ( Ex: HTB{my_sup3r_fl4g} )').setRequired(true))
            )
            .addSubcommand(scmd => scmd
                .setName('remove')
                .setDescription('Remove a session target')
                .addIntegerOption(opt => opt.setName('session_id').setDescription('Session ID').setRequired(true))
                .addStringOption(opt => opt.setName('target_name').setDescription('Target name').setRequired(true))
            )
            .addSubcommand(scmd => scmd
                .setName('get')
                .setDescription('Get a session target content')
                .addIntegerOption(opt => opt.setName('session_id').setDescription('Session ID').setRequired(true))
                .addStringOption(opt => opt.setName('target_name').setDescription('Target name').setRequired(true))
            )
            .addSubcommand(scmd => scmd
                .setName('list')
                .setDescription('Get session targets')
                .addIntegerOption(opt => opt.setName('session_id').setDescription('Session ID').setRequired(true))
            )
        ),
	async execute(interaction, bot) {
        if(!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return interaction.reply({embeds: [bot.Funcs.getErrorEmbed(`You do not have the necessary permissions for this command`)], ephemeral: true});
	
        
    }
};