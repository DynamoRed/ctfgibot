module.exports = (bot) => {
	bot.handleEvents = async (eventFiles, path, callback) => {
		bot.Funcs.writeLog(`Handling events`, 'title');

		bot.Funcs.writeLog(`Scanning events folder`);
		for (const file of eventFiles) {
			const event = require(`../events/${file}`);
			bot.Funcs.writeLog(`Found ${event.name}: ${file}`, 'log');
			if (event.once) {
				bot.once(event.name, (...args) => event.execute(...args, bot));
			} else {
				bot.on(event.name, (...args) => event.execute(...args, bot));
			}
		}
		if(callback && typeof(callback) == Function) callback();
	};
};