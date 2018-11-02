/*

FoxyBoyJr Discord bot by Wohlstand

REQUIRED:
https://github.com/hydrabolt/discord.js
+ (no voice) npm install discord.js --save
+ (with voice) npm install discord.js opusscript --save
+ (optional) npm install bufferutil --save
http://nodemailer.com/
+ npm install nodemailer --save
+ npm install yandex.translate
+ npm install mysql
+ npm install winston

Authorize bot:

https://discordapp.com/oauth2/authorize?client_id=<put your bot's ID here>&scope=bot&permissions=67169280

Replace "<put your bot's ID here>" with actual ID of your bot

Example:
https://discordapp.com/oauth2/authorize?client_id=216943869424566273&scope=bot&permissions=67169280

0x00000800
0x00000400
0x00002000
0x00004000
0x00008000
0x04000000

400+800+2000+4000+8000+4000000
67169280(10)

*/

const filesystem  = require("fs");
const Discord     = require("discord.js");
let   botCommands = require("./bot_commands");
const foxyBotCli  = new Discord.Client();
// WatchDog for SystemD
const notify      = require('sd-notify');

let   botPrefix = "/foxy";
let   botUserId = "0";

console.log("==========================================================");
console.log("                  FoxyBot by Wohlstand                    ");
console.log("==========================================================");

console.log("Using Discord.JS version " + Discord.version + "");

let foxyPlugins = [];

let loadPlugins = function(dir)
{
    let results = [];

    filesystem.readdirSync(dir).forEach(function(file)
    {
        let pluginName = file.substring(0, file.length - 3);
        file = dir + '/' + file;
        let stat = filesystem.statSync(file);
        if(stat && stat.isDirectory()) {}
        else if(file.endsWith(".js"))
        {
            botCommands.foxylogInfo('Loading plugin: ' + file);
            let pluginPath = file.substring(0, file.length - 3);
            try
            {
                let plugin = require(pluginPath);
                if(typeof(plugin.setBot) === "function")
                    plugin.setBot(foxyBotCli);
                plugin.pluginName = pluginName;
                plugin.pluginPath = pluginPath;
                plugin.pluginStatus = "Ok";
                foxyPlugins.push(plugin);
            }
            catch(e)
            {
                let plugin = [];
                plugin.pluginName = pluginName;
                plugin.pluginPath = pluginPath;
                plugin.pluginStatus = "Failed: [" + e.name + "]" + e.message;
                botCommands.foxylogInfo("Failed to load plugin " + file + " because of exception: " + e.name + ":\n\n" + e.message);
                foxyPlugins.push(plugin);
            }
        }
    });
    return results;
};


function loadBotCommands()
{
    // Load bot prefox
    if(botCommands.botConfig.prefix !== undefined)
        botPrefix = botCommands.botConfig.prefix;

    //Register common commands
    botCommands.registerCommands();
    //Register INTERNAL commands
    botCommands.addCMD(["plugins-status",   pluginsList, "Show list of my plugins", [], true]);
    botCommands.addCMD(["plugins-reload",   pluginsReload, "Show list of my plugins", [], true]);
    //Initialize built-in lists
    botCommands.cachedFiles_init();
    //Register per-plugin commands
    foxyPlugins.forEach(function(plugin)
    {
        try
        {
            if(typeof(plugin.setBot) === "function")
                plugin.setBot(foxyBotCli);
            if(typeof(plugin.registerCommands) === "function")
                plugin.registerCommands(botCommands);
        }
        catch(e)
        {
            plugin.pluginStatus = "Failed to register commands: [" + e.name + "]" + e.message;
            botCommands.foxylogInfo("Failed to initialize plugin " + file + " because of exception: " + e.name + ":\n\n" + e.message);
        }
    });
}

try
{
    loadPlugins("./plugins");
    loadBotCommands();
}
catch(e)
{
    console.log("Failed to initialize plugin " + file + " because of exception: " + e.name + ":\n\n" + e.message);
}

function pluginsList(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    let pluginsInfo = "My plugins:\n";
    pluginsInfo += "```\n";
    foxyPlugins.forEach(function(plugin)
    {
        pluginsInfo += " * " + plugin.pluginName + " - " + plugin.pluginStatus + "\n";
    });
    pluginsInfo += "```\n";
    message.channel.send(pluginsInfo).catch(botCommands.msgSendError);
}

function pluginsReload(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    let isMyBoss = (botCommands.botConfig.myboss.indexOf(message.author.id) !== -1);

    if(!isMyBoss)
    {
        message.reply("You are not granted to reload my plugins!", botCommands.msgSendError);
        return;
    }

    //Destroy all plugins
    foxyPlugins.forEach(function(plugin)
    {
        if(typeof(plugin.unloadPlugin) === "function")
            plugin.unloadPlugin();//Call plugin destructor
        delete require.cache[require.resolve(plugin.pluginPath)];
    });

    //Load plugins again
    foxyPlugins = [];
    loadPlugins("./plugins");

    botCommands.clearCommands();
    loadBotCommands();

    let pluginsInfo = "My plugins has been reloaded!\nResult:\n";
    pluginsInfo += "```\n";
    foxyPlugins.forEach(function(plugin)
    {
        pluginsInfo += " * " + plugin.pluginName + " - " + plugin.pluginStatus + "\n";
    });
    pluginsInfo += "```\n";
    message.channel.send(pluginsInfo).catch(botCommands.msgSendError);
}


function statusError(error)
{
    if(error)
    {
        botCommands.foxylogInfo('There was an error seting status: ' + error);
    }
}

function nickError(error)
{
    if(error)
    {
        botCommands.foxylogInfo('There was an error seting nick: ' + error);
    }
}

function sleep(milliseconds)
{
    let start = new Date().getTime();
    for(let i = 0; i < 1e7; i++)
    {
        if ((new Date().getTime() - start) > milliseconds)
        {
            break;
        }
    }
}

process.on('SIGINT', function()
{
    botCommands.foxylogInfo("\n\nCaught interrupt signal\n");
    foxyBotCli.user.setStatus("idle");
    foxyBotCli.user.setActivity("Interrupted");
    //mybot.setPlayingGame("Interrupted", statusError);
    botCommands.foxylogInfo("Sent \"Away\" status!");
    sleep(1000);
    process.exit();
});

process.on('SIGHUP', function()
{
    botCommands.foxylogInfo("\n\nCaught SIGHUP signal\n");
    foxyBotCli.user.setStatus("dnd");
    foxyBotCli.user.setActivity("Screen killed");
    //mybot.setStatusIdle();
    //mybot.setPlayingGame("Screen killed", statusError);
    botCommands.foxylogInfo("Sent \"Away\" status!");
    sleep(1000);
    process.exit();
});

let greetingSent = false;

foxyBotCli.on("ready", () =>
{
    notify.ready();
    const watchdogInterval = 2800;
    botCommands.foxylogInfo('Initializing SystemD WatchDog with ' + watchdogInterval + ' millseconds internal ...');
    notify.startWatchdogMode(watchdogInterval);

    //Get ID of self
    botUserId = foxyBotCli.user.id;

    botCommands.foxylogInfo('set status...');
    //mybot.setStatusOnline();
    foxyBotCli.user.setStatus("online");
    foxyBotCli.user.setActivity(botPrefix + " cmd");
    //console.log('set nick...');
    //mybot.setNickname(mybot.servers[0], "FoxyBot", mybot.user, nickError);
    //Start Remind watcher!
    botCommands.initRemindWatcher(foxyBotCli);
    if(!greetingSent)
    {
        //Send greeting message once on startup
        botCommands.postGreeting(foxyBotCli);
        greetingSent = true;
    }
    console.log('DONE!\n==========================================================\n\n');
});

foxyBotCli.on("error", (e) =>
{
    console.log('!!HOLY COW!!\n' + e.message + '\n==========================================================\n\n');
});

foxyBotCli.on('reconnecting', () =>
{
    botCommands.foxylogInfo('Connection lost, trying to reconnect...');
});

foxyBotCli.on("guildMemberAdd", (newUser) =>
{
    //Fetch new-became user
    newUser.guild.fetchMember(newUser).catch(botCommands.msgSendError);

    foxyPlugins.forEach(function(plugin)
    {
        if(typeof(plugin.guildMemberAdd) === "function")
            plugin.guildMemberAdd(foxyBotCli, newUser);
    });
});

foxyBotCli.on("guildMemberUpdate", (oldUser, newUser) =>
{
    if(newUser.user.username == null)
        return;
    if(oldUser.user.username == null)
        return;

    //Log nick changes
    if(oldUser.nickname !== newUser.nickname)
    {
        botCommands.foxylogInfo(
          "--- "
          + oldUser.user.username + "#" + oldUser.user.discriminator + " changed nick: "
          + (oldUser.user.bot ? "bot" : "user")
          + " \"" + (oldUser.nickname == null ? oldUser.user.username : oldUser.nickname) + "\""
          + " now known as "
          + "\"" + (newUser.nickname == null ? newUser.user.username : newUser.nickname) + "\" on "
          + newUser.guild.name + "!"
        );
    }
});

foxyBotCli.on("presenceUpdate", (oldUser, newUser) =>
{
    if(newUser.nickname == null)
        return;

    let nickOfBot = newUser.nickname;
    let newStatus = newUser.presence.status;
    let chan = foxyBotCli.channels.get(botCommands.botConfig.defaultChannel[0]);//boopZone
    //console.log('=> User ' + newUser.nickname + ' was changed to ' + newStatus + '\n');

    switch(newUser.id)
    {
    /*
    case "182039820879659008":
        if(newStatus == "online")
        {
            chan.send("WOOO-HOO!!! :metal::skin-tone-1:").catch(botCommands.msgSendError);
        }
    break;
    */
    case "247080657182785546"://Yoshi's Egg
        if(newStatus === "online")
        {
            setTimeout(function()
            {
                chan.send("Ah ow.. :open_mouth: Fried Egg is here!..." +
                    ( (nickOfBot !== "Yoshi Egg") ?
                    "\nIt is masquarated as \"" + nickOfBot + "\", be careful!" : "")
                ).catch(botCommands.msgSendError);
            }, 3000);
        }
    break;
    case "216688100032643072"://When Botane died
        if(newStatus === "offline")
        {
            //Send to #beeo-boop "WOO-HOO!!" since Botane is dead
            chan.send("Botane is dead, WOOO-HOO!!! :metal::skin-tone-1:").catch(botCommands.msgSendError);
        }
    break;
    case "216273975939039235": //LunaBot died
        if(newStatus === "offline")
        {
            chan.send("<@214408564515667968>, LunaBot is dead...\n" +
                      "WHY???? :hushed:\n " +
                      "She was a VERY good bot! :sob:").catch(botCommands.msgSendError);
        }
    break;
    case "216243239391330305"://Bastion died
        if(newStatus === "offline")
        {
            chan.send("Bastion is dead?! :hushed: What happen with it?").catch(botCommands.msgSendError);
        }
    break;
    }
});

function getAuthorStr(message)
{
    let z  = message.author;
    let ch = message.channel;
    let gu = message.guild;

    try
    {
        return "[" +  (z.bot ? "bot" : "user") + "] "
                + ( (ch.type === 'dm') ?
                           z.username
                        : (message.member.nickname == null ? z.username : message.member.nickname)
                  )
                + " <@" + z.username + "#" + z.discriminator + ", "
                + ( (ch.type === 'dm') ? "PM" : (ch.name + '@' + gu.name) )
                + ">";
    }
    catch(e)
    {
        return e.name;
    }
}

foxyBotCli.on("messageDelete", function(message)
{
    if(message.author.id === botUserId)
        return;//Ignore messages sent by myself

    if(message.webhookID)
        return;//Reject webhooks!

    botCommands.foxylogInfo("*D* " + getAuthorStr(message) + ": " + message.content);
    let allowWrite = botCommands.isWritableChannel(message.channel.id);
    allowWrite = allowWrite && botCommands.isWritableGuild(message.guild.id);
    foxyPlugins.forEach(function(plugin)
    {
        if(typeof(plugin.messageDelete) === "function")
            plugin.messageDelete(foxyBotCli, message, allowWrite);
    });
});

foxyBotCli.on("messageUpdate", function(messageOld, messageNew)
{
    if(messageOld.author.id === botUserId)
        return;//Ignore messages sent by myself

    if(messageOld.webhookID)
        return;//Reject webhooks!

    botCommands.foxylogInfo("*E* "+ getAuthorStr(messageOld) + ":"
                            + "\n OLD: " + messageOld.content
                            + "\n NEW: " + messageNew.content + "\n");

    let allowWrite = botCommands.isWritableChannel(messageOld.channel.id);
    allowWrite = allowWrite && botCommands.isWritableGuild(messageOld.guild.id);
    foxyPlugins.forEach(function(plugin)
    {
        if(typeof(plugin.messageUpdate) === "function")
            plugin.messageUpdate(foxyBotCli, messageOld, messageNew, allowWrite);
    });
});

foxyBotCli.on("message", function(message)
{
    if(message.author.id === botUserId)
        return;//Ignore messages sent by myself

    let allowWrite = botCommands.isWritableChannel(message.channel.id);
    allowWrite = allowWrite && botCommands.isWritableGuild(message.guild.id);

    let msgTrimmed      = message.cleanContent.trim();
    let msgLow          = message.cleanContent.toLowerCase();
    let msgLowTrimmed   = msgLow.trim();

    if(message.webhookID)
    {
        botCommands.foxylogInfo("*** [WebHook] " + message.webhookID + ": " + message.content);
        return;//Reject web hooks!
    }

    botCommands.foxylogInfo("*** " + getAuthorStr(message) + ": " + message.content );

    /* *********Standard command processor********* */
    if((msgLowTrimmed === botPrefix) && (allowWrite))
    {
        try
        {
            if(botCommands.inListFile("black_global.txt", message.author.id))
            {
                return;
            }
            message.channel.send("Hello, I'm **FoxyBot**!\n" +
                                        "   Type **" + botPrefix + " cmd** to learn my commands\n" +
                                        "   Type __**" + botPrefix + " help <command>**__ to read detail help for specific command.")
                                            .catch(botCommands.msgSendError);
        }
        catch(e)
        {
            botCommands.sendErrorMsg(foxyBotCli, message.channel, e);
        }
    }
    else
    if(allowWrite && msgLowTrimmed.startsWith(botPrefix + " "))
    {
        let botCmd = msgTrimmed.slice(botPrefix.length + 1).trim();
        botCommands.foxylogInfo("Cmd received: " + botCmd);

        let firstSpace = botCmd.indexOf(' ');
        if(firstSpace === -1)
            firstSpace = botCmd.indexOf('\n');
        let botCommand = "";
        let botArgs = "";
        if(firstSpace !== -1)
        {
            botCommand = botCmd.slice(0, firstSpace).trim();
            botArgs = botCmd.slice(firstSpace + 1).trim();
            botCommands.foxylogInfo("->>Cmd: " + botCommand);
            botCommands.foxylogInfo("->>Arg: " + botArgs);
        }
        else
            botCommand = botCmd.trim();
        botCommands.callCommand(foxyBotCli, message, botCommand.toLowerCase(), botArgs);
    }
    else
    {
        foxyPlugins.forEach(function(plugin)
        {
            if(typeof(plugin.messageIn) === "function")
                plugin.messageIn(foxyBotCli, message, allowWrite);
        });
    }
});

botCommands.loginBot(foxyBotCli, botCommands.botConfig.token);

setInterval(function()
{
    if(global.gc)
    {
        global.gc();
    } else {
        console.log('Garbage collection unavailable.  Pass --expose-gc '
          + 'when launching node to enable forced garbage collection.');
    }
    console.log('Memory usage:', process.memoryUsage());
}, 1800000); //Every half of hour

