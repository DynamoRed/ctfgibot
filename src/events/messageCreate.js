const Config = require('../../conf');
const { MessageEmbed, Permissions } = require('discord.js');

module.exports = {
	name: 'messageCreate',
	async execute(message, bot) {
        if(message.author.bot) return;

        const guildId = message.guild.id;
        if(message.member.roles.cache.has(Config.Roles[guildId].MUTED)) return message.delete();

        if(!Config.Channels[message.guild.id].CommandsOnly.includes(message.channel.id)) return;
        if(message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return;

        let repMessage = await message.reply({embeds: [bot.Funcs.getErrorEmbed(`You can't send messages here !`)]});

        setTimeout(() => {
            repMessage.delete();
        }, 5000)

        let logEmb = new MessageEmbed()
            .setColor(Config.Colors.Transparent)
            .setDescription(`\`\`\`\n 🖊️ Blocked message \n\`\`\`
            » ${message.author} try to send \`${message.content}\` in ${message.channel}`);

        message.guild.channels.cache.get(Config.Channels[message.guild.id].LOGS).send({embeds: [logEmb]});

        message.delete();
	}
};