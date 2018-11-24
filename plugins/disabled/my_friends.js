/*
    A small plugin to help Foxy help his friends like Echidnabot
*/

let core = undefined;
let exec = require('child_process').execFile;

let CODEHAUS_Server = "215661302692052992";
const echidnasDir = "/home/vitaly/_Bots/echidnabot";
const minnieDir = "/home/vitaly/_Bots/minnie-marygold";

function isGranted(message)
{
    return (core.botConfig.myboss.indexOf(message.author.id) !== -1) || (message.author.id === "133426635998232577");
}

function knuxLog(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    if(!isGranted(message))
    {
        message.reply("Sorry, I can't help you, you are not allowed to use this command");
        return;
    }

    let linesNumber = (args === "" ? 25 : Number(args));

    exec('tail', ["-n", linesNumber.toString(), "knuxlog.log"], {cwd: echidnasDir}, function(err, data)
    {
        if(!err)
        {
            let s = data.toString();
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

function knuxFullLog(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    if(!isGranted(message))
    {
        message.reply("Sorry, I can't help you, you are not allowed to use this command");
        return;
    }

    exec('bzip2', ["-fk", echidnasDir + "/knuxlog.log"], {cwd: echidnasDir}, function(err, data)
    {
        if(!err)
            message.channel.sendFile(echidnasDir + "/knuxlog.log.bz2", "knuxlog.log.bz2").catch(core.msgSendError);
        else
            message.reply("ERROR of bzip2 -fk " + echidnasDir + "/knuxlog.log\n```\n" + err + "\n\n" + data.toString() + "\n```\n");
    });

}

function pokeBot(bot, message, botPath)
{
    if(!isGranted(message))
    {
        message.reply("Sorry, I can't help you, you are not allowed to use this command");
        return;
    }

    exec('git', ["pull", "origin", "master"], {cwd: botPath}, function(err, data)
    {
        if(!err)
            message.reply("git pull origin master\n```\n" + data.toString() + "\n```\n");
        else
        {
            message.reply("ERROR of git pull origin master```\n" + err + "\n\n" + data.toString() + "\n```\n");
            exec('git', ["merge", "--abort"], {cwd: botPath}, function(err, data){});
        }
    });
}

function knuxPoke(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    pokeBot(bot, message, echidnasDir);
}

function minniePoke(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    pokeBot(bot, message, minnieDir);
}


function systemDofBot(bot, message, botPath, botName, action)
{
    if(!isGranted(message))
    {
        message.reply("Sorry, I can't help you, you are not allowed to use this command");
        return;
    }

    exec('sudo', ["systemctl", action, botName], {cwd: botPath}, function(err, data)
    {
        let fullCommand = "systemctl " + action + " " + botName;
        if(!err)
            message.reply(fullCommand + "\n```\n" + data.toString() + "\n```\n");
        else
            message.reply("ERROR of " + fullCommand + "```\n" + err + "\n\n" + data.toString() + "\n```\n");
    });
}

function minnieStart(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, minnieDir, "discord-minnie", "start");
}

function minnieStop(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, minnieDir, "discord-minnie", "stop");
}

function minnieRestart(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, minnieDir, "discord-minnie", "restart");
}

function minnieStatus(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, minnieDir, "discord-minnie", "status");
}

function knuxStart(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, minnieDir, "discord-knux", "start");
}

function knuxStop(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, minnieDir, "discord-knux", "stop");
}

function knuxRestart(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, minnieDir, "discord-knux", "restart");
}

function knuxStatus(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, minnieDir, "discord-knux", "status");
}

function registerCommands(foxyCore)
{
    core = foxyCore;
    core.addCMD(["knuxlog",    knuxLog,           "Check out Knux's log tail. Has optional argument - a count of lines to print.", [], true, [CODEHAUS_Server] ]);
    core.addCMD(["knuxlogfile",knuxFullLog,       "Get a complete Knux's log file.", [], true, [CODEHAUS_Server] ]);
    core.addCMD(["knuxpoke",   knuxPoke,          "Poke Knux if he is asleep", [], true, [CODEHAUS_Server] ]);
    core.addCMD(["minniepoke", minniePoke,        "Poke Minnie Marygold if she is asleep", [], true, [CODEHAUS_Server] ]);

    core.addCMD(["knux-start",   knuxStart,   "Start Knuckles", [], true, [CODEHAUS_Server] ]);
    core.addCMD(["knux-stop",    knuxStop,    "Stop Knuckles", [], true, [CODEHAUS_Server] ]);
    core.addCMD(["knux-restart", knuxRestart, "Restart Knuckles", [], true, [CODEHAUS_Server] ]);
    core.addCMD(["knux-status",  knuxStatus,  "Show status of Knuckles", [], true, [CODEHAUS_Server] ]);

    core.addCMD(["minnie-start",   minnieStart,   "Start Minnie Marygold", [], true, [CODEHAUS_Server] ]);
    core.addCMD(["minnie-stop",    minnieStop,    "Stop Minnie Marygold", [], true, [CODEHAUS_Server] ]);
    core.addCMD(["minnie-restart", minnieRestart, "Restart Minnie Marygold", [], true, [CODEHAUS_Server] ]);
    core.addCMD(["minnie-status",  minnieStatus,  "Show status of Minnie Marygold", [], true, [CODEHAUS_Server] ]);
}

module.exports =
{
    registerCommands:   registerCommands
};
