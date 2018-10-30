/*
    A dummy skeleton plugin. Created as simplest example of FoxyBot's plugin creation
*/

// Main module of FoxyBot
var core = undefined;

// Example bot command
var setAvatar = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    var isMyBoss = (core.botConfig.myboss.indexOf(message.author.id) !== -1) || message.member.roles.has(core.botConfig.modsRole);
    if(isMyBoss)
        bot.user.setAvatar(args);
    else
        message.reply("You can't use this command!", core.msgSendError);
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
    core.addCMD(["setavatar",      setAvatar,           "Change Foxy's avatar"]);
}

module.exports =
{
    // Initialize plugin and here you can add custom Foxy's commands
    registerCommands:   registerCommands
};
