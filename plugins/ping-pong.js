/*
    Ping delay measurement
*/

// Main module of FoxyBot
var core = undefined;

// Example bot command
var pingReply = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    message.reply("Pong! (" + (Date.now() - message.createdTimestamp) + " ms)");
}

// Initialize plugin and here you can add custom Foxy's commands
function registerCommands(/*bot_commands.js module*/ foxyCore)
{
    core = foxyCore;
    // Command structure:
    // name[0] {string}
    // function(bot,msg,args)[1] {function pointer}
    // help[2], {string}
    // synonims[3], {array of strings}
    // isUseful[4], {bool}
    // limitOnGuilds[5] {array of strings}
    core.addCMD(["ping",      pingReply,           "Let's play ping-pong!"]);
}

module.exports =
{
    // Initialize plugin and here you can add custom Foxy's commands
    registerCommands:   registerCommands
};

