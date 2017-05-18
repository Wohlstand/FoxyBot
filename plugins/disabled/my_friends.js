/*
    A small plugin to help Foxy help his friends like Echidnabot
*/

var core = undefined;
var exec = require('child_process').execFile;

var CODEHAUS_Server = "215661302692052992";
var echidnasDir = "/home/vitaly/_Bots/echidnabot";

function isGranted(message)
{
    return (message.author.id == core.botConfig.myboss) || (message.author.id == "133426635998232577");
}

var knuxLog = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    if(!isGranted(message))
    {
        message.reply("Sorry, I can't help you, you are not allowed to use this command");
        return;
    }

    exec('tail', ["-n", "25", "knuxlog.log"], {cwd: echidnasDir}, function(err, data)
    {
        if(err == null)
            message.reply("tail -n 25 knuxlog.log\n```\n" + data.toString() + "\n```\n");
        else
        {
            message.reply("ERROR of tail -n 25 knuxlog.log```\n" + err + "\n\n" + data.toString() + "\n```\n");
        }
    });
}

var knuxPoke = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    if(!isGranted(message))
    {
        message.reply("Sorry, I can't help you, you are not allowed to use this command");
        return;
    }

    exec('git', ["pull", "origin", "master"], {cwd: echidnasDir}, function(err, data)
    {
        if(err == null)
            message.reply("git pull origin master\n```\n" + data.toString() + "\n```\n");
        else
        {
            message.reply("ERROR of git pull origin master```\n" + err + "\n\n" + data.toString() + "\n```\n");
            exec('git', ["merge", "--abort"], {cwd: echidnasDir}, function(err, data){});
        }
    });
}

function registerCommands(foxyCore)
{
    core = foxyCore;
    core.addCMD(["knuxlog",   knuxLog,           "Check out Knux's log tail", [], true, [CODEHAUS_Server] ]);
    core.addCMD(["knuxpoke",  knuxPoke,          "Poke Knux if he is asleep", [], true, [CODEHAUS_Server] ]);
}

module.exports =
{
    registerCommands:   registerCommands
};
