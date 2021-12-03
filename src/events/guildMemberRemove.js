const Config = require('../../conf');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'guildMemberRemove',
	async execute(member, bot) {
        let logEmb = new MessageEmbed() 
            .setColor(Config.Colors.Red)
            .setDescription(`\`\`\`\n 📤 Member left \n\`\`\`
            » <@${member.user.id}> just left our server`);

        member.guild.channels.cache.get(Config.Channels[member.guild.id].LOGS).send({embeds: [logEmb]});
	}
};