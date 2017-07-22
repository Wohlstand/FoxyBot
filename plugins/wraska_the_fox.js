/*
    Automatical reply to Roboloe when it does "/luna kawaii" after few seconds
*/

// Main module of FoxyBot
var core = undefined;

// Initialize plugin and here you can add custom Foxy's commands
function registerCommands(/*bot_commands.js module*/ foxyCore)
{
    core = foxyCore;
}

var roboloeSpeech = [
     "/luna senpai",
     "/luna sempai",
     "/luna fart",
     "/luna farts",
     "/luna butt",
     "/luna butts",
     "/luna dank",
     "/luna chan",
     "/luna kun",
     "/luna tan",
     "/luna yotsuba",
     "/luna lewd",
     "/luna frogsuit",
     "/luna kawaii"
];

// Catch incoming messages: you can make foxy be more talkative or implement a custom command handler from the raw text
function messageIn(/*Client*/ bot, /*Message*/ message, /*bool*/ channelIsWritable)
{
    var msgTrimmed      = message.content.trim();
    if(channelIsWritable && (message.author.id == 320247723641012235) && (roboloeSpeech.indexOf(msgTrimmed) != -1))
    {
        setTimeout(function()
        {
            message.channel.send("No one anime girl kawaii more than Wraska Snowy Fox").catch(core.msgSendError);
        }, 3000);
        setTimeout(function()
        {
            if(typeof(core.wraska) != 'undefined')
                core.wraska(bot, message, "wraska");
        }, 3500);
    }
}

module.exports =
{
    // Initialize plugin and here you can add custom Foxy's commands
    registerCommands:   registerCommands,
    // Catch incoming messages: you can make foxy be more talkative or implement a custom command handler from the raw text
    messageIn:          messageIn
};
