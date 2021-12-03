let Config = module.exports = {};

Config.Infos = {};
Config.Colors = {};
Config.Roles = [];
Config.Channels = [];
Config.MySQL = {};

Config.Infos.Name = "CaptureTheBOT";
Config.Infos.Version = "beta-1.0.0";

Config.Colors.Blurple = "#5865F2";
Config.Colors.Yellow = "#FEE75C";
Config.Colors.Green = "#57F287";
Config.Colors.Red = "#ED4245";
Config.Colors.Transparent = "#2f3136";

Config.MySQL.HOST = "127.0.0.1";
Config.MySQL.PORT = 3306;
Config.MySQL.USER = "ctfgi_bot";
Config.MySQL.DATABASE = "ctfgi";

/**
 * CaptureTheESGI Server Config
 */
const ctfgiGuildId = '915564553486598145';

Config.Roles[ctfgiGuildId] = {};
Config.Channels[ctfgiGuildId] = {};

Config.Roles[ctfgiGuildId].SEEKER = "915625991831949453";
Config.Roles[ctfgiGuildId].MEMBER = "915625947879837786";
Config.Roles[ctfgiGuildId].MANAGER = "915564609375723560";
Config.Roles[ctfgiGuildId].MUTED = "916323093134344202";

Config.Channels[ctfgiGuildId].GENERAL = "915564553960558603";
Config.Channels[ctfgiGuildId].LOGS = "916003297008177152";
Config.Channels[ctfgiGuildId].MODS_ONLY = "916002962868957265";
Config.Channels[ctfgiGuildId].REGISTER = "916003786928041984";
Config.Channels[ctfgiGuildId].CommandsOnly = [Config.Channels[ctfgiGuildId].REGISTER];