/*
    Server information commands
*/

// Main module of FoxyBot
var core = undefined;
var exec = require('child_process').execFile;

var serverUptime = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    exec('uptime', ["--pretty"], {}, function(err, data)
    {
        if(err == null)
        {
            var s = data.toString();
            if(s.length > 1900)
                s = s.substr(s.length - 1900);
            message.channel.send("Uptime of server is\n```\n" + s + "\n```\n").catch(core.msgSendError);
        }
        else
        {
            message.reply("ERROR of uptime --pretty```\n" + err + "\n\n" + data.toString() + "\n```\n");
        }
    });
}

var serverUnameA = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    exec('uname', ["-a"], {}, function(err, data)
    {
        if(err == null)
        {
            var s = data.toString();
            if(s.length > 1900)
                s = s.substr(s.length - 1900);
            message.channel.send("UNAME:\n```\n" + s + "\n```\n").catch(core.msgSendError);
        }
        else
        {
            message.reply("ERROR of uname -a```\n" + err + "\n\n" + data.toString() + "\n```\n");
        }
    });
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
    core.addCMD(["server-uptime",      serverUptime,    "Retreive uptime of server where I living now :desktop:"]);
    core.addCMD(["server-uname",       serverUnameA,    "Get short information about server's operating system"]);
}

module.exports =
{
    // Initialize plugin and here you can add custom Foxy's commands
    registerCommands:   registerCommands
};
