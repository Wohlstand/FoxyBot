/*
    A helper which will forward a email as message
*/

// Main module of FoxyBot
var core = undefined;

var util = require("util");

// Email client
var Client = require('node-poplib-gowhich').Client;

var bot = undefined;

function setBot(botInstance)
{
    bot = botInstance;
}

function parseMessage(msg)
{
    var uid = /UserID: \[(\d+)\]/gi;
    var gid = /GuildID: \[(\d+)\]/gi;
    var cid = /ChannelID: \[(\d+)\]/gi;

    var uidMatch = uid.exec(msg.text);
    var gidMatch = gid.exec(msg.text);
    var cidMatch = cid.exec(msg.text);

    //console.log("UID: " + util.inspect(uidMatch));
    //console.log("GID: " + util.inspect(gidMatch));
    //console.log("CID: " + util.inspect(cidMatch));
    if(uidMatch != null && gidMatch != null && cidMatch != null)
    {
        msg.uid = uidMatch[1];
        msg.gid = gidMatch[1];
        msg.cid = cidMatch[1];
    }
}

var client;

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

	setInterval(function()
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

                        var msgRes = {text: message.text, uid: 0, gid: 0, cid: 0};
                        parseMessage(msgRes);
                        var outText = "```\n" + msgRes.text + "\n```";
                        var chan = bot.channels.get(msgRes.cid != 0 ? msgRes.cid : core.botConfig.defaultChannel[0]);

                        chan.send("__I got email reply from " + message.from[0].name + " for " + (msgRes.uid != 0 ? "<@" + msgRes.uid + ">" : "someone") + "__:\n",
                            {
                                embed:
                                {
                                    color: 0xAF0000,
                                    fields: [{
                                        name : message.subject,
                                        value: outText
                                    }],
                                    footer: {
                                        text: "Note: to send email reply, you must have 'Wohlstand' (or 'Wohl') mention in every your message (letter sign 📧 means email was sent)"
                                    }
                                }
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
    }, 20000);
}

module.exports =
{
    setBot:   setBot,
    registerCommands:   registerCommands
};

