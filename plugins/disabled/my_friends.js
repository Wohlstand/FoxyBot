/*
    A small plugin to help Foxy help his friends like Echidnabot
*/

let core = undefined;
let exec = require('child_process').execFile;

let CODEHAUS_Server = "215661302692052992";
let TEST_SERVER = "506558672130801665";
const echidnasDir = "/home/vitaly/_Bots/echidnabot";
const minnieDir = "/home/vitaly/_Bots/minnie-marigold";
const bastionDir = "/home/vitaly/_Bots/bastionbot-js";
const roboloeDir = "/home/vitaly/_Bots/roboloe";

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
        if(err)
        {
            message.reply("ERROR of git pull origin master```\n" + err + "\n\n" + data.toString() + "\n```\n");
            exec('git', ["merge", "--abort"], {cwd: botPath}, function(err, data){});
        }
        else
        {
            message.reply("git pull origin master\n```\n" + data.toString() + "\n```\n");
            exec('npm', ["install"], {cwd: botPath}, function(err, data)
            {
                if(err)
                    message.reply("ERROR of npm install```\n" + err + "\n\n" + data.toString() + "\n```\n");
                else
                    message.reply("npm install\n```\n" + data.toString() + "\n```\n");
            });
        }
    });
}

function knuxPull(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    pokeBot(bot, message, echidnasDir);
}

function minniePull(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    pokeBot(bot, message, minnieDir);
}

function bastionPull(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    pokeBot(bot, message, bastionDir);
}

function roboloePull(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    pokeBot(bot, message, roboloeDir);
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

 /* -------- Minnie -------- */
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

/* -------- Knux -------- */
function knuxStart(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, minnieDir, "discord-knux", "start");
}

function knuxStop(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, echidnasDir, "discord-knux", "stop");
}

function knuxRestart(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, echidnasDir, "discord-knux", "restart");
}

function knuxStatus(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, echidnasDir, "discord-knux", "status");
}

/* -------- Bastion -------- */
function bastionStart(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, bastionDir, "discord-bastion", "start");
}

function bastionStop(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, bastionDir, "discord-bastion", "stop");
}

function bastionRestart(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, bastionDir, "discord-bastion", "restart");
}

function bastionStatus(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, bastionDir, "discord-bastion", "status");
}

/* -------- Roboloe -------- */
function roboloeStart(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, bastionDir, "discord-roboloe", "start");
}

function roboloeStop(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, bastionDir, "discord-roboloe", "stop");
}

function roboloeRestart(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, bastionDir, "discord-roboloe", "restart");
}

function roboloeStatus(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    systemDofBot(bot, message, bastionDir, "discord-roboloe", "status");
}


function registerCommands(foxyCore)
{
    core = foxyCore;
    core.addCMD(["knuxlog",    knuxLog,           "Check out Knux's log tail. Has optional argument - a count of lines to print.", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addCMD(["knuxlogfile",knuxFullLog,       "Get a complete Knux's log file.", [], true, [CODEHAUS_Server, TEST_SERVER] ]);

    core.addCMD(["knux-pull",   knuxPull,         "Pull fresh changes of Knux", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addSynonimOf("knux-pull", "knux-poke");
    core.addSynonimOf("knux-pull", "knuxpoke");
    core.addCMD(["knux-start",   knuxStart,       "Start Knuckles", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addCMD(["knux-stop",    knuxStop,        "Stop Knuckles", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addCMD(["knux-restart", knuxRestart,     "Restart Knuckles", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addCMD(["knux-status",  knuxStatus,      "Show status of Knuckles", [], true, [CODEHAUS_Server, TEST_SERVER] ]);

    core.addCMD(["minnie-pull", minniePull,       "Pull fresh changes of Minnie Marigold", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addSynonimOf("minnie-pull", "minnie-poke");
    core.addSynonimOf("minnie-pull", "minniepoke");
    core.addCMD(["minnie-start",   minnieStart,   "Start Minnie Marigold", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addCMD(["minnie-stop",    minnieStop,    "Stop Minnie Marigold", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addCMD(["minnie-restart", minnieRestart, "Restart Minnie Marigold", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addCMD(["minnie-status",  minnieStatus,  "Show status of Minnie Marigold", [], true, [CODEHAUS_Server, TEST_SERVER] ]);

    core.addCMD(["basty-pull",     bastionPull,   "Pull fresh changes of B'astion", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addSynonimOf("basty-pull", "basty-poke");
    core.addSynonimOf("basty-pull", "bastypoke");
    core.addCMD(["basty-start",   bastionStart,   "Start B'astionBot", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addCMD(["basty-stop",    bastionStop,    "Stop B'astionBot", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addCMD(["basty-restart", bastionRestart, "Restart B'astionBot", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addCMD(["basty-status",  bastionStatus,  "Show status of B'astionBot", [], true, [CODEHAUS_Server, TEST_SERVER] ]);

    core.addCMD(["roboloe-pull",     roboloePull,   "Pull fresh changes of Roboloe Bot", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addSynonimOf("roboloe-pull", "roboloe-poke");
    core.addSynonimOf("roboloe-pull", "roboloepoke");
    core.addCMD(["roboloe-start",   roboloeStart,   "Start R'oboloe Bot", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addCMD(["roboloe-stop",    roboloeStop,    "Stop R'oboloe Bot", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addCMD(["roboloe-restart", roboloeRestart, "Restart R'oboloe Bot", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
    core.addCMD(["roboloe-status",  roboloeStatus,  "Show status of R'oboloe Bot", [], true, [CODEHAUS_Server, TEST_SERVER] ]);
}

module.exports =
{
    registerCommands:   registerCommands
};
