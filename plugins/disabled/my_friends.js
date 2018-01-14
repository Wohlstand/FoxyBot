/*
    A small plugin to help Foxy help his friends like Echidnabot
*/

var core = undefined;
var exec = require('child_process').execFile;

var CODEHAUS_Server = "215661302692052992";
var echidnasDir = "/home/vitaly/_Bots/echidnabot";

function isGranted(message)
{
    return (core.botConfig.myboss.indexOf(message.author.id) != -1) || (message.author.id == "133426635998232577");
}

var knuxLog = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    if(!isGranted(message))
    {
        message.reply("Sorry, I can't help you, you are not allowed to use this command");
        return;
    }

    var linesNumber = (args == "" ? 25 : Number(args));

    exec('tail', ["-n", linesNumber.toString(), "knuxlog.log"], {cwd: echidnasDir}, function(err, data)
    {
        if(err == null)
        {
            var s = data.toString();
            if(s.length > 1900)
                s = s.substr(s.length - 1900);
            message.reply("tail -n " + linesNumber + " knuxlog.log\n```\n" + s + "\n```\n");
        }
        else
        {
            message.reply("ERROR of tail -n 25 knuxlog.log```\n" + err + "\n\n" + data.toString() + "\n```\n");
        }
    });
}

var knuxFullLog = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    if(!isGranted(message))
    {
        message.reply("Sorry, I can't help you, you are not allowed to use this command");
        return;
    }

    exec('bzip2', ["-fk", echidnasDir + "/knuxlog.log"], {cwd: echidnasDir}, function(err, data)
    {
        if(err == null)
            message.channel.sendFile(echidnasDir + "/knuxlog.log.bz2", "knuxlog.log.bz2").catch(core.msgSendError);
        else
            message.reply("ERROR of bzip2 -fk " + echidnasDir + "/knuxlog.log\n```\n" + err + "\n\n" + data.toString() + "\n```\n");
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
    core.addCMD(["knuxlog",   knuxLog,           "Check out Knux's log tail. Has optional argument - a count of lines to print.", [], true, [CODEHAUS_Server] ]);
    core.addCMD(["knuxlogfile",knuxFullLog,       "Get a complete Knux's log file.", [], true, [CODEHAUS_Server] ]);
    core.addCMD(["knuxpoke",  knuxPoke,          "Poke Knux if he is asleep", [], true, [CODEHAUS_Server] ]);
}

module.exports =
{
    registerCommands:   registerCommands
};
