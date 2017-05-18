/*
    A dummy skeleton plugin. Created as simplest example of FoxyBot's plugin creation
*/

// Main module of FoxyBot
var core = undefined;

// Example bot command
var dummyPlugTest = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    message.reply("Dummy plugin is works!");
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
    core.addCMD(["dummy",      dummyPlugTest,           "It's a dumy plugin testing!!!"]);
}

// Catch the newbie joining
function guildMemberAdd(/*Client*/ bot, /*GuildMember*/ guildMember)
{}

// Catch incoming messages: you can make foxy be more talkative or implement a custom command handler from the raw text
function messageIn(/*Client*/ bot, /*Message*/ message, /*bool*/ channelIsWritable)
{}

module.exports =
{
    // Initialize plugin and here you can add custom Foxy's commands
    registerCommands:   registerCommands,
    // Catch the newbie joining
    guildMemberAdd:     guildMemberAdd,
    // Catch incoming messages: you can make foxy be more talkative or implement a custom command handler from the raw text
    messageIn:          messageIn
};
