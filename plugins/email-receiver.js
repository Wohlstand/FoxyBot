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

function parseMessage(text)
{
    var reg = /User \*.+\* \((.+)\)/gi;
    var arr = reg.exec(text);

    if(arr != null)
    {
        return "@" + arr[1] + ",\n" + "```\n" + text + "\n```";
    }

    return "```\n" + text + "\n```";
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

                        var chan = bot.channels.get(core.botConfig.defaultChannel[0]);

                        chan.send("__I got email from " + message.from['name'] + "__:\n",
                            {
                                embed:
                                {
                                    color: 0xAF0000,
                                    fields: [{
                                        name : message.subject,
                                        value: parseMessage(message.text)
                                    }],
                                    footer: {
                                        text: "Note: to send email reply, you must have 'Wohlstand' (or 'Wohl') mention in every your message (even it is short)"
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

