/*
    A helper which will forward a email as message
*/

// Main module of FoxyBot
var core = undefined;

var util = require("util");
var schedule = require('node-schedule');
var htmlToText = require('html-to-text');

// Email client
var Client = require('node-poplib-gowhich').Client;

var bot = undefined;

function setBot(botInstance)
{
    bot = botInstance;
}

// User in this list will be never pinged
function isNoPingUser(userId)
{
    return (core.botConfig.pessimists.indexOf(userId) != -1)
}

function parseMessage(msg)
{
    var uid = /UserID: \[(\d+)\]/gi;
    var gid = /GuildID: \[(\d+)\]/gi;
    var cid = /ChannelID: \[(\d+)\]/gi;

    var uidMatch = uid.exec(msg.text);
    var gidMatch = gid.exec(msg.text);
    var cidMatch = cid.exec(msg.text);
    try
    {
        if(uidMatch != null)
            msg.uid = uidMatch[1];
        if(gidMatch != null)
            msg.gid = gidMatch[1];
        if(cidMatch != null)
            msg.cid = cidMatch[1];
    }
    catch(e)
    {
        console.log("parseMessage: FAILED: " + e.name);
    }
}

var client;

var mailChecker = function()
{
    //console.log("Check email now...");

    client.connect(function()
    {
        //console.log("Connect");
        client.stat(function(err, stat)
        {
            //console.log("STAT  err " + err + " stat " + util.inspect(stat));
            if(stat.count == 0)
            {
                client.quit();
                return;
            }

            client.retrieveAll(function(err, messages)
            {
                console.log("RETREIVE err " + err);
                if(err != null)
                {
                    client.quit();
                    return;
                }

                messages.forEach(function(message)
                {
                    console.log(message.subject);
                    console.log("Message from: " + util.inspect(message.from));
                    console.log("Message body:\n===============\n\n" + util.inspect(message) + "\n\n========================\n");
                    var msgText = (typeof(message.text) != "undefined" ? message.text : htmlToText.fromString(message.html));
                    var msgRes = {text: msgText, uid: 0, gid: 0, cid: 0};
                    parseMessage(msgRes);
                    var outText = "\n" + msgText;
                    var chan = bot.channels.get(msgRes.cid != 0 ? msgRes.cid : core.botConfig.defaultChannel[0]);

                    chan.send("__I got email reply from " + message.from[0].name + " for " +
                                (msgRes.uid != 0 ? (isNoPingUser(msgRes.uid) ? msgRes.uid : ("<@" + msgRes.uid + ">") ) : "someone")
                                + "__:\n",
                        {
                            embed:
                            {
                                color: 0xAF0000,
                                fields: [{
                                    name : message.subject,
                                    value: outText
                                }],
                                footer: {
                                    text: "Note: to send email to me, begin every your message with 'Wohlstand:' (or 'Wohl:') (letter sign 📧 means email was sent)"
                                }
                            }, split: true
                        }
                    ).catch(core.msgSendError);
                });

                client.deleteAll(function(err, statuses)
                {
                    console.log("DEL: err " + err);
                    client.quit();
                });
            })
        });
    });
};

var emailSchedule;

var emailChecker;

function unloadPlugin()
{
    console.log("Unloading plugin...");
    emailSchedule.cancel();
    //clearInterval(emailChecker);
}

// Initialize plugin and here you can add custom Foxy's commands
function registerCommands(/*bot_commands.js module*/ foxyCore)
{
    core = foxyCore;

    client = new Client({
        hostname: core.botConfig.pop.host,
        port:  core.botConfig.pop.port,
        tls: false,
        mailparser: true,
        username: core.botConfig.pop.login,
        password: core.botConfig.pop.pass
    });

    console.log("Initializing email checking...");
    emailSchedule = schedule.scheduleJob('* * * * *', mailChecker);
    //emailChecker = setInterval(mailChecker, 20000);
}

module.exports =
{
    setBot:   setBot,
    registerCommands:   registerCommands,
    unloadPlugin:       unloadPlugin
};

