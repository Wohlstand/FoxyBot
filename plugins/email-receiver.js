/*
    A helper which will forward a email as message
*/

// Main module of FoxyBot
let core = undefined;

let util = require("util");
let schedule = require('node-schedule');
let htmlToText = require('html-to-text');

// Email client
const popLib = require('node-poplib-gowhich');
let Client = popLib.Client;

let bot = undefined;

function setBot(botInstance)
{
    bot = botInstance;
}

// User in this list will be never pinged
function isNoPingUser(userId)
{
    return (core.botConfig.pessimists.indexOf(userId) !== -1)
}

function parseMessage(msg)
{
    let uid = /UserID: \[(\d+)]/gi;
    let gid = /GuildID: \[(\d+)]/gi;
    let cid = /ChannelID: \[(\d+)]/gi;

    let uidMatch = uid.exec(msg.text);
    let gidMatch = gid.exec(msg.text);
    let cidMatch = cid.exec(msg.text);
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

let client;

function mailChecker()
{
    //console.log("Check email now...");
    try
    {
        client.connect(function()
        {

            try
            {
                //console.log("Connect");
                client.stat(function(err, stat)
                {
                    try
                    {
                        //console.log("STAT  err " + err + " stat " + util.inspect(stat));
                        if(stat.count === 0)
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

                            try
                            {
                                messages.forEach(function(message)
                                {
                                    console.log(message.subject);
                                    console.log("Message from: " + util.inspect(message.from));
                                    console.log("Message body:\n===============\n\n" + util.inspect(message) + "\n\n========================\n");
                                    let msgText = (typeof(message.text) !== "undefined" ? message.text : htmlToText.fromString(message.html));
                                    let msgRes = {text: msgText, uid: 0, gid: 0, cid: 0};
                                    parseMessage(msgRes);
                                    msgText = msgText.replace(/^>.*\n?/mg, '');
                                    msgText = msgText.replace(/^\d\d\.\d\d\.\d\d\d\d \d?\d:\d\d, FoxyBot on Discord .*:\n?/mg, '');
                                    let outText = "\n" + msgText;
                                    let chan = bot.channels.get(msgRes.cid !== 0 ? msgRes.cid : core.botConfig.defaultChannel[0]);
                                    let isWritable = core.isWritableChannelId(msgRes.cid) && core.isWritableGuild(chan.guild);

                                    if(isWritable)
                                    {
                                        chan.send("__I got email reply from " + message.from[0].name + " for " +
                                                    (msgRes.uid !== 0 ? (isNoPingUser(msgRes.uid) ? msgRes.uid : ("<@" + msgRes.uid + ">") ) : "someone")
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
                                    }
                                    else
                                    {
                                        console.log("EmailReciver: Can't post email because of write permission denied!");
                                    }
                                });

                                /*jslint unparam: true*/
                                client.deleteAll(function(err, statuses)
                                {
                                    /*jslint unparam: false*/
                                    console.log("DEL: err " + err);
                                    client.quit();
                                });
                            }
                            catch(e)
                            {
                                console.log("EmailReciver: messages.forEach(function(message): FAILED: " + e.name);
                            }
                        })
                    }
                    catch(e)
                    {
                        console.log("EmailReciver: client.retrieveAll(function(err, messages): FAILED: " + e.name);
                    }
                });
            }
            catch(e)
            {
                console.log("EmailReciver: client.stat(function(err, stat): FAILED: " + e.name);
            }
        });
    }
    catch(e)
    {
        console.log("EmailReciver: client.connect(function()): FAILED: " + e.name);
    }
}



let emailSchedule;

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

    if(core.botConfig.pop.disabled !== undefined && core.botConfig.pop.disabled)
    {
        console.log("Email checking was disabled, skipping...");
        return;
    }

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

