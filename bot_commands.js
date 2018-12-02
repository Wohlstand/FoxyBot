const fs          = require('fs');
const nodeMailer  = require('nodemailer');
const escape      = require('escape-html');
const mysql       = require('mysql');
const Discord     = require("discord.js");

let foxyBotPackage  = require("./package.json");
let responses       = require("./responses.json");

let foxyBotVer  = foxyBotPackage.name + " v" + foxyBotPackage.version;

let winston = require('winston');

let logger = new (winston.Logger)(
{
    transports: [
        new (winston.transports.Console)({ json: false, timestamp: true }),
        new winston.transports.File({ filename: __dirname + '/foxybot-debug.log', json: false })
    ],
    exceptionHandlers: [
        new (winston.transports.Console)({ json: false, timestamp: true }),
        new winston.transports.File({ filename: __dirname + '/foxybot-errors.log', json: false })
    ],
    exitOnError: false
});

function foxyLogInfo(outmsg)
{
    logger.info(outmsg);
}

function foxyLogError(outmsg)
{
    logger.error(outmsg);
}

// Command structure: name[0], function(bot,msg,args)[1], help[2], synonims[3], isUseful[4], limitOnGuilds[5]
const CMD_NAME = 0;
const CMD_FUNCTION = 1;
const CMD_HELPTEXT = 2;
const CMD_SYNONIMS = 3;
const CMD_ISUSEFUL = 4;
const CMD_LIMIT_ON_GUILDS = 5;

//! List of available bot commands
let Cmds      = [];
let CmdsREAL  = [];

//! Recent auth token
let authToken = "";

//! Pointer to the bot
let BotPtr;

let botConfig = require("./setup.json");

let smtpMailLoginInfo = botConfig.smtp.login;
let smtpMailFrom      = botConfig.smtp.from;
let smtpMailTo        = botConfig.smtp.to;

let my_db = undefined;

let my_db_enabled = (botConfig.mysql.disabled !== undefined) && (botConfig.mysql.disabled !== true);

function connectMyDb()
{
    if(my_db_enabled && my_db === undefined)
    {
        my_db = mysql.createPool({
              connectionLimit : 5,
              host     : botConfig.mysql.host,
              user     : botConfig.mysql.user,
              password : botConfig.mysql.password,
              database : botConfig.mysql.db,
              charset  : 'UTF8MB4_UNICODE_CI'
        });
        //my_db.connect();
    }
}

function disconnectMyDb()
{
    if(my_db_enabled && my_db !== undefined)
    {
        my_db.end(function(err) {
            console.log("Database disconnect error: " + err.message + "");
            my_db = undefined;
        });
    }
    my_db = undefined;
}

function reconnectMyDb()
{
    if(!my_db_enabled)
        return;
    disconnectMyDb();
    connectMyDb();
}

function errorMyDb(error, results, fields)
{
    if(error)
    {
        foxyLogInfo("Error happen! " + error + "; Results " + results.length + "; Fields: " + fields.length);
        reconnectMyDb();
    }
}

connectMyDb();

/* ******************Internal black/white lists ********************************/

//let globalBlackList = [216273975939039235];//LunaBot

//let trollTimerBlackList = [216273975939039235];//LunaBot

//let emailBlackList = [];//216273975939039235//LunaBot
let emailWhiteList = [
    212297373827727360,//Yoshi021
    182039820879659008,//Wohlstand
    214408564515667968,//Hoeloe
    215683390211358720,//Rednaxela
    140164947723288576,//Kevsoft
    83200193150844928, //Joey
    91682181734211584, //Minna
    209072523600461824,//PixelPest
    133426635998232577 //RockyTheChao
];
/* *****************************************************************************/

/***********************************************************
*                  INTERNAL FUNCTIONS                      *
***********************************************************/

Object.size = function(obj)
{
    let size = 0, key;
    for(key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function getRandomInt(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sendErrorMsg(bot, channel, e)
{
    channel.send("**OUCH** :dizzy_face: \n```\n"+
                 "Name:    " + e.name + "\n"+
                 "Message: " + e.message + "\n\n"+
                 e.stack + "```").then(function(){}, msgSendError).catch(msgSendError);
}


let msgFailedAttempts = 0;

function loginBot(bot, token)
{
    authToken = token;
    bot.login(authToken).catch(msgSendError);
    BotPtr = bot;
}

function msgSendError(error, message)
{
    if (error)
    {
        console.log("Fail to send message: " + message);
        let ErrorText = "Can't send message because: " + error;
        foxyLogInfo(ErrorText);
        if(++msgFailedAttempts > 2)
        {
            foxyLogInfo("Trying to relogin...");
            loginBot(BotPtr, authToken);
            msgFailedAttempts = 0;
        }
    } else {
        msgFailedAttempts = 0;
    }
}

function msgDeleteError(error, message)
{
    if (error)
    {
        console.log("Fail to delete message: " + message);
        let ErrorText = "Can't delete message because: " + error;
        foxyLogInfo(ErrorText);
    }
}

function getMsgText(message)
{
    if(message.embeds.length > 0)
    {
        let txt = [];
        message.embeds.forEach(function(kek, i, ar)
        {
            let e = {};
            if(kek.description)
                e.description = kek.description;
            if(kek.title)
                e.title = kek.title;
            if(kek.url)
                e.url = kek.url;
            if(kek.color)
                e.color = kek.color;
            if(kek.image)
            {
                e.image = {};
                if(e.image.url)
                    e.image.url = kek.image.url;
            }
            if(kek.footer)
            {
                e.footer = {};
                if(e.footer.iconUrl)
                    e.footer.iconUrl = kek.footer.iconUrl;
                if(e.footer.text)
                    e.footer.text = kek.footer.text;
            }
            txt.push(e);
        });
        return JSON.stringify({embeds : txt, content: message.content});
    }
    else
    {
        return message.content;
    }
}

function secondsToTimeDate(time)
{
    let days    = parseInt( time/86400, 10);
    let hours   = parseInt((time/3600)%24, 10);
    let minutes = parseInt((time/60)%60, 10);
    let seconds = parseInt( time%60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return  (days !== 0 ? days + " days, " : "" ) +
            (hours !== 0 ? hours + " hours, " : "" ) +
            (minutes !== "00" ? minutes + " minutes and " : "" ) +
            (seconds !== "00" ? seconds + " seconds!" : "");
}


let botStartedAt = new Date().getTime();
function getBotUptime()
{
    let end = new Date().getTime();
    let time = (end - botStartedAt)/1000;

    return "**I'm working**: " + secondsToTimeDate(time);
}

function getLocalTime()
{
    let currentdate = new Date();
    return "**My local time in Moscow is**: "
            /*+ currentdate.getFullYear() + "-"
              + (currentdate.getMonth()+1)  + "-"
              + currentdate.getDate() + " @ " */
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + /*":" + currentdate.getSeconds() +*/ " UTC+3";
}

function inList(list, userID)
{
    if(list.length > 0)
    {
        for(let i=0; i < list.length; i++)
        {
            if(userID === list[i])
            {
                return true;
            }
        }
    }
    return false;
}

let cachedFiles = {};

function cachedFiles_loadFile(file, alias)
{
    cachedFiles[alias] = [];
    var userList = fs.readFileSync(__dirname + "/" + file);
    var userArr = userList.toString().trim().split(/[\n ]/g);
    for(var i = 0; i < userArr.length; i++)
        cachedFiles[alias].push(userArr[i].trim());
}

function cachedFiles_init()
{
    cachedFiles = {};
    cachedFiles_loadFile("lists/boop_zone.txt", "boop_zone.txt");
    cachedFiles_loadFile("lists/readonly_chans.txt", "readonly_chans.txt");
    cachedFiles_loadFile("lists/readonly_guilds.txt", "readonly_guilds.txt");
}

function inListFile(file, userID)
{
    return !((!cachedFiles.hasOwnProperty(file)) || (cachedFiles[file].indexOf(userID) === -1));
}

function cachedFiles_ReLeload(bot, message, args)
{
    let isMyBoss = (botConfig.myboss.indexOf(message.author.id) !== -1);
    if(!isMyBoss)
    {
        message.reply("You are not granted to reload my built-in lists!", msgSendError);
        return;
    }

    cachedFiles_init();

    message.channel.send("Lists has been reloaded!\n" +
    "```\n" + JSON.stringify(cachedFiles) + "\n```"
    ).catch(msgSendError);
}

function cachedFiles_Check(bot, message, args)
{
    var keys = args.split(/[\n ]/g);
    if((keys.length === 1) && (keys[0].trim() === ""))
    {
        message.reply("you sent me nothing! I can't check the list! :confused:").catch(msgSendError);
        return;
    }
    if(inListFile(keys[0], keys[1]))
        message.channel.send("Yes, the **" + keys[1] + "** is listed in **" + keys[0] + "** list!").catch(msgSendError);
    else
        message.channel.send("No, the **" + keys[1] + "** is NOT listed in **" + keys[0] + "** list!").catch(msgSendError);
}

function isWritableGuild(guild)
{
    if(!guild)
        return true; // If it's DM, allow
    return !inListFile("readonly_guilds.txt", guild.id);
}

function isWritableChannel(channel)
{
    if(channel.type === "dm")
        return true;//DM is writable!

    let guild = BotPtr.guilds.get(channel.guild.id);
    let botMember = guild.members.get(BotPtr.user.id);
    let perms = channel.permissionsFor(botMember);
    let hasWrite = perms.has('SEND_MESSAGES');

    if(hasWrite === true)
        return !inListFile("readonly_chans.txt", channel.id);
    return false;
}

function isWritableChannelId(channelId)
{
    if(!BotPtr)
        return false;// Bot is not working!
    let chan = BotPtr.channels.get(channelId);
    if(!chan)
    {
        foxyLogError("isWritableChannelId: Can't find channel ID " + channelId);
        return false;
    }
    let guild = BotPtr.guilds.get(chan.guild.id);
    let botMember = guild.members.get(BotPtr.user.id);
    let perms = chan.permissionsFor(botMember);
    let hasWrite = perms.has('SEND_MESSAGES');
    if(hasWrite === true)
        return !inListFile("readonly_chans.txt", chan.id);
    return false;
}

function getArrayRandom(array)
{
    if(array == null)
        return {index:null, value:null};
    else
    {
        let id = getRandomInt(0, array.length - 1);
        let val = array[id];
        return {index:id, value:val}
    }
}

function getDefaultChannelForGuild(bot, message)
{
    let channel = message.channel;
    botConfig.defaultChannel.forEach(function(chanID, i, arr)
    {
        foxyLogInfo("Trying to look for channel " + chanID);
        let chan = bot.channels.get(chanID);
        if(chan && chan.guild.id === message.guild.id)
            channel = chan;
    });
    return channel;
}

/***********************************************************
*                    API FUNCTIONS                         *
***********************************************************/

function test(bot, message, args)
{
    message.reply("Test works!");
}

function postGreeting(bot)
{
    /*
    botConfig.defaultChannel.forEach(function(chanID, i, arr)
    {
        var chan = bot.channels.get(chanID);
        chan.send(getArrayRandom(responses.enter).value).catch(msgSendError);
    });
    */
    let chan = bot.channels.get(botConfig.defaultChannel[0]);
    chan.send(getArrayRandom(responses.enter).value).catch(msgSendError);
}

function isBeepBoop(bot, message, args)
{
    let channel = getDefaultChannelForGuild(bot, message);
    if(channel.id === message.channel.id)
    {
        message.reply("No, on this server is no beep-boop channel", msgSendError);
    } else {
        message.reply("Yes, on this server is a <#" + channel.id + "> channel", msgSendError);
    }
}


function inviteMeLink(bot, message, args)
{
    let perms = 130112;
    let url = "https://discordapp.com/oauth2/authorize?client_id=" + bot.user.id + "&scope=bot&permissions=" + perms;
    message.author
        .send("Yim! I'll come to your server if you'll open this link:\n" + url + "\nBe happy! :fox:")
        .catch(msgSendError);
}

let sayLogArr = [];
function say(bot, message, args)
{
    let chan = message.channel;
    let attachments = message.attachments.array();
    let authorname  = message.author.username;

    if(attachments.length === 0)
    {
        chan.send(args).then(function(){}, msgSendError).catch(msgSendError);
    }
    else
    for(let i=0; i < attachments.length; i++)
    {
        let attachm = attachments[i];
        chan.send(args).catch(msgSendError).reject(msgSendError);
        chan.sendFile(attachm.url, attachm.filename).then(function(){}, msgSendError).catch(msgSendError);
    }

    if(attachments.length === 0)
        message.delete().then(function(){}, msgDeleteError).catch(msgDeleteError);

    sayLogArr.push([authorname, args]);
    if(sayLogArr.length > 5)
        sayLogArr.shift();
}

function sayTTS(bot, message, args)
{
    let chan = message.channel;
    let attachments = message.attachments.array();
    let authorname  = message.author.username;

    if(attachments.length === 0)
    {
        chan.send(args, {"tts" : true}).then(function(){}, msgSendError).catch(msgSendError);
    }
    else
    for(let i=0; i < attachments.length; i++)
    {
        let attachm = attachments[i];
        chan.send(args, {"tts" : true}).then(function(){}, msgSendError).catch(msgSendError);
        chan.sendFile(attachm.url, attachm.filename).then(function(){}, msgSendError).catch(msgSendError);
    }

    if(attachments.length === 0)
        message.delete().then(function(){}, msgDeleteError).catch(msgDeleteError);

    sayLogArr.push([authorname, args]);
    if(sayLogArr.length > 5)
        sayLogArr.shift();
}

function sayLog(bot, message, args)
{
    if(sayLogArr.length > 0)
    {
        var whoTold="";
        for(var i=0; i < sayLogArr.length; i++)
        {
            whoTold += sayLogArr[i][0] + " told \"" + sayLogArr[i][1] + "\"\n";
        }
        message.channel.send(whoTold).catch(msgSendError);
    } else {
        message.channel.send("No sayd phrases :weary:").catch(msgSendError);
    }
}

function cutWord(str)
{
    str.orig = str.orig.trim();
    let space = str.orig.indexOf(' ');
    if(space === -1)
        return "";
    let word = str.orig.substr(0, space);
    str.res = str.orig.substr(space).trim();
    foxyLogInfo("-> Cuted first word \"" + word + "\"");
    return word;
}

function getMsFromMsg(bot, message, args)
{
    let time = args;
    let timeInt = 0;

    let reg_sec = /([0-9]+)\s*(?:sec(?:ond)?[s]?)/gi;
    let reg_min = /([0-9]+)\s*(?:min(?:ute)?[s]?)/gi;
    let reg_hrs = /([0-9]+)\s*(?:hour[s]?)/gi;
    let reg_day = /([0-9]*)\s*day[s]?/gi;
    let reg_week = /([0-9]*)\s*week[s]?/gi;

    let match = reg_sec.exec(time);
    while(match != null)
    {
        timeInt += parseInt(match[0]) * 1000;
        match = reg_sec.exec(time);
    }

    match = reg_min.exec(time);
    while(match != null)
    {
        timeInt += parseInt(match[0]) * 1000 * 60;
        match = reg_min.exec(time);
    }

    match = reg_hrs.exec(time);
    while(match != null)
    {
        timeInt += parseInt(match[0]) * 1000 * 60 * 60;
        match = reg_hrs.exec(time);
    }

    match = reg_day.exec(time);
    while(match != null)
    {
        timeInt += parseInt(match[0]) * 1000 * 60 * 60 * 24;
        match = reg_day.exec(time);
    }

    match = reg_week.exec(time);
    while(match != null)
    {
        timeInt += parseInt(match[0]) * 1000 * 60 * 60 * 24 * 7;
        match = reg_week.exec(time);
    }


    if(isNaN(timeInt))
    {
        message.reply("Really? Tell me time again please!", msgSendError);
        return -1;
    }

    if(timeInt === 0)
    {
        message.reply("I don't know which time unit you meant?!", msgSendError);
        return -1;
    }
    return timeInt;
}

function initRemindWatcher(bot)
{
    if(!my_db_enabled)
        return; //Reminder requires DB support. Withot DB, disable reminder completely

    BotPtr = bot;
    //Check for remind every minute
    setInterval(function()
    {
        try
        {
            my_db.query('SELECT * FROM foxy_reminds WHERE dest_date <= NOW();',
            function (error, results, fields)
            {
                try
                {
                    if(error)
                    {
                        foxyLogInfo("Error happen! " + error);
                        return;
                    }

                    //foxyLogInfo('The solution is: ', results[0].solution);
                    for(let i = 0; i < results.length; i++)
                    {
                        /*
                        var guild = BotPtr.guilds.get(results[i].guild_id);
                        if(guild == undefined)
                        {
                            foxyLogInfo("Error happen! No guild with ID " + results[i].guild_id + "!");
                        } else { */
                            //var channel = guild.channels.get(results[i].channel_id);
                            var channel = BotPtr.channels.get(results[i].channel_id);
                            if(channel === undefined)
                                foxyLogInfo("Error happen! No channel with ID " + results[i].channel_id + "!");
                            else
                            {
                                foxyLogInfo("Foxy's remind: " + results[i].message);
                                channel.send(results[i].message).catch(msgSendError);
                            }
                        /*}*/
                    }

                    my_db.query("DELETE FROM foxy_reminds WHERE dest_date <= NOW();", errorMyDb);
                }
                catch(e)
                {
                    sendErrorMsg(bot, message.channel, e);
                }
            });
        }
        catch(e)
        {
            foxyLogInfo("Error happen! " + e.name + ":" + e.message);
            //Try to reconnect MySQL
            reconnectMyDb();
        }

    }, 60000); //Check the database every minute
}

function sayDelayd(bot, message, args)
{
    if(!my_db_enabled)
    {
        message.reply("Sorry, this command is inavailable for now...", msgSendError);
        return;
    }

    let index = args.lastIndexOf("after ");
    if((index === -1) || (index > (index.length-7)))
    {
        message.reply("You missed time!", msgSendError);
        return;
    }


    var timeInt = getMsFromMsg(bot, message, args.slice(index + 6));

    if(timeInt === -1)
        return;

    if(isNaN(timeInt))
    {
        message.reply("You pissed me off! I'v got NaN...", msgSendError);
        return;
    }

    let some = args.slice(0, index).trim();
    let guild_id = (message.channel.type === 'dm') ? 0 : message.channel.guild.id;
    let chan_id  = message.channel.id;
    let waitTime = my_db.escape(timeInt/1000);
    //foxyLogInfo("Remind: Wait " + (timeInt/1000) + " vs " +  waitTime + " seconds!");
    let insertQuery =   "INSERT INTO foxy_reminds (dest_date, message, guild_id, channel_id) "+
                        "values ((NOW() + INTERVAL " + waitTime + " SECOND), " +
                        my_db.escape(some.toString()) + ", " +
                        my_db.escape(guild_id) + ", " +
                        my_db.escape(chan_id) + ");";
    //foxyLogInfo(typeof(guild_id) + ", " + typeof(chan_id) + " " + my_db.escape(guild_id) + " Query is: " + insertQuery);
    my_db.query(insertQuery, errorMyDb);
    //
    // setTimeout(function()
    // {
    //     message.channel.send(some).catch(msgSendError);
    // }, timeInt);
    message.reply("I will say after " + secondsToTimeDate(timeInt/1000) + "!", msgSendError);
}

function sayDelaydME(bot, message, args)
{
    if(!my_db_enabled)
    {
        message.reply("Sorry, this command is inavailable for now...", msgSendError);
        return;
    }

    let index = args.lastIndexOf("after ");
    if((index === -1) || (index > (index.length-7)))
    {
        message.reply("You missed time!", msgSendError);
        return;
    }

    let timeInt = getMsFromMsg(bot, message, args.slice(index+6));

    if(timeInt === -1)
        return;

    if(isNaN(timeInt))
    {
        message.reply("You pissed me off! I'v got NaN...", msgSendError);
        return;
    }

    let some = "<@" + message.author.id + ">, " + args.slice(0, index).trim();
    let guild_id    = (message.channel.type === 'dm') ? 0 : message.channel.guild.id;
    let chan_id     = message.channel.id;
    let waitTime    = my_db.escape(timeInt/1000);
    let insertQuery =   "INSERT INTO foxy_reminds (dest_date, message, guild_id, channel_id) "+
                        "values ((NOW() + INTERVAL " + waitTime + " SECOND), " +
                        my_db.escape(some.toString()) + ", " +
                        my_db.escape(guild_id) + ", " +
                        my_db.escape(chan_id) + ");";
    //foxyLogInfo(typeof(guild_id) + ", " + typeof(chan_id) + " " + my_db.escape(guild_id) + " Query is: " + insertQuery);
    my_db.query(insertQuery, errorMyDb);
    // setTimeout(function()
    // {
    //     message.reply(some, msgSendError);
    // }, timeInt);
    message.reply( "I will remind you after " + secondsToTimeDate(timeInt/1000) + "!", msgSendError);
}


function setPlayingGame(bot, message, args)
{
    bot.user.setActivity(args, {
        type: "PLAYING"
    })
        .then(presence => foxyLogInfo(`Playing game set to ${presence.game ? presence.game.name : 'none'}`))
        .catch(foxyLogError);
}

function setWatchingVideo(bot, message, args)
{
    bot.user.setActivity(args, {
        type: "WATCHING"
    })
        .then(presence => foxyLogInfo(`Watching set to ${presence.game ? presence.game.name : 'none'}`))
        .catch(foxyLogError);
}

function setListeningMusic(bot, message, args)
{
    bot.user.setActivity(args, {
        type: "LISTENING"
    })
        .then(presence => foxyLogInfo(`Listening set to ${presence.game ? presence.game.name : 'none'}`))
        .catch(foxyLogError);
}

function setStreaming(bot, message, args)
{
    bot.user.setActivity(args, {
        url: "http://github.com/",
        type: "STREAMING"
    })
        .then(presence => foxyLogInfo(`Streaming set to ${presence.game ? presence.game.name : 'none'}`))
        .catch(foxyLogError);
}


function myTime(bot, message, args)
{
    message.channel.send(getLocalTime()).catch(msgSendError);
}

function upTimeBot(bot, message, args)
{
    message.channel.send(getBotUptime()).catch(msgSendError);
}

function aboutBot(bot, message, args)
{
    let stats1 = fs.statSync("foxy.js");
    let stats2 = fs.statSync("bot_commands.js");

    let t = "**" + foxyBotVer + "**\nCreated by **Wohlstand**, built on the Node.JS\n";
    t += getBotUptime() + "\n";
    t += getLocalTime() + "\n";
    t += "\n";
    t += "**Kernel** __*(foxy.js)*__ - updated " + stats1["mtime"] + "\n";
    t += "**Functions** __*(bot_commands.js)*__ - updated " + stats2["mtime"] + "\n";
    t += "\n";
    t += "Guilds where I am: **" + bot.guilds.size + "**.\n";
    t += "Channels where I am: **" + bot.channels.size + "**.\n";
    t += "Users I can see: **" + bot.users.size + "**.\n";
    t += "\n";
    t += "Totally I know **" + Cmds.length + "** commands.\n";
    t += "Unique are **" + CmdsREAL.length + "** commands.\n";
    t += "\n";
    t += "**Node.js** version " + process.versions['node'] + "\n";
    t += "**V8** version " + process.versions['v8'] + "\n";
    t += "**Discord.js API** version " + Discord.version + "\n";
    t += "\n";
    message.channel.send(t).catch(msgSendError);
}

function sendEmailFile(message, args, attachment, doReply)
{
    if(botConfig.smtp.disabled !== undefined && botConfig.smtp.disabled)
    {
        console.log("SMTP support is disabled...");
        if(doReply)
        {
            message.channel.send('SMTP support is disabled!').catch(msgSendError);
        }
        return;
    }

    let extraFiles = [];
    let attachments = message.attachments.array();

    for(let i = 0; i < attachments.length; i++)
    {
        let attachm = attachments[i];
        extraFiles[i] = {
                           filename: attachm.filename,
                           path: attachm.url
                        };
    }

    extraFiles[i] = {
                   filename: attachment.name,
                   path: attachment.path
                };
    message.guild.fetchMember(message.author)
    .then(function(gotMember)
    {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodeMailer.createTransport(smtpMailLoginInfo);

        let usr_nick = (gotMember.nickname == null ? message.author.username : gotMember.nickname);
        let usr_sign = (message.author.username + "#" + message.author.discriminator);

        // setup e-mail data with unicode symbols
        let mailOptions =
        {
            from: smtpMailFrom, // sender address
            //to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
            to: smtpMailTo, // list of receivers
            subject: 'Message from ' + (message.author.bot ? "bot" : "user")
                      + " " + usr_nick
                      + ' (@' + usr_sign + ")"
                      + ' in the channel #' + message.channel.name + '@' + message.guild.name, // Subject line
            //text: args, //plaintext body
            html: '<p><img alt="[avatar]" style="vertical-align: middle; width: 48px; height: 48px; border-radius: 50%; box-shadow: 2px 2px 5px 0;" src="' + message.author.avatarURL + '"> '+
                    (message.author.bot ?
                        '<span style="background-color: #00004F; color: #FFFFFF; border-radius: 5px; padding: 0 4px 0 4px;">Bot</span>' :
                        '<span style="background-color: #004F00; color: #FFFFFF; border-radius: 5px; padding: 0 4px 0 4px;">User</span>') + ' ' +
                  '<b>' + usr_nick + '</b> <small>(' + usr_sign + ')</small></p>' +
                  '<p><b><u>#' + message.channel.name + '</u></b>@' + message.guild.name + '</p>' +
                  '<p><pre style="border-width: 1px; border-color: #000000; border-style: solid; border-radius: 8px; box-shadow: 2px 2px 5px 0; padding: 10px;">' + escape(args) + '</pre></p>' +
                  '<p><h3>Meta-data</h3></p>' +
                  '<ul>' +
                  '<li> UserID: [' + message.author.id + ']</li>' +
                  '<li> GuildID: [' + message.guild.id + ']</li>' +
                  '<li> ChannelID: [' + message.channel.id + ']</li>' +
                  '</ul>',  //html body
            attachments: extraFiles
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info)
        {
            if(doReply)
            {
                if(error)
                {
                    message.channel.send('Failed to send mail: ' + error).catch(msgSendError);
                    return;
                }
                message.channel.send('Message sent: ' + info.response).catch(msgSendError);
            }
        });
    }).catch(function(err){
        message.reply("Something weird happen! I have catched an error at myself! (error is [" + err +"])", core.msgSendError);
    });
}


function sendEmailF(message, args, doReply)
{
    if(botConfig.smtp.disabled !== undefined && botConfig.smtp.disabled)
    {
        console.log("SMTP support is disabled...");
        if(doReply)
        {
            message.channel.send('SMTP support is disabled!').catch(msgSendError);
        }
        return;
    }

    let extraFiles = [];
    let attachments = message.attachments.array();

    for(let i = 0; i < attachments.length; i++)
    {
        let attachm = attachments[i];
        extraFiles[i] = {
                           filename: attachm.filename,
                           path: attachm.url
                        };
    }

    message.guild.fetchMember(message.author)
    .then(function(gotMember)
    {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodeMailer.createTransport(smtpMailLoginInfo);

        let usr_nick = (gotMember.nickname == null ? message.author.username : gotMember.nickname);
        let usr_sign = (message.author.username + "#" + message.author.discriminator);

        // setup e-mail data with unicode symbols
        let mailOptions =
        {
            from: smtpMailFrom, // sender address
            //to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
            to: smtpMailTo, // list of receivers
            subject: 'Message from ' + (message.author.bot ? "bot" : "user")
                      + " " + (gotMember.nickname == null ? message.author.username : gotMember.nickname)
                      + ' (@' + message.author.username + "#" + message.author.discriminator + ")"
                      +  ' in the channel #' + message.channel.name + '@' + message.guild.name, // Subject line
            //text: args, //plaintext body
            html: '<p><img alt="[avatar]" style="vertical-align: middle; width: 48px; height: 48px; border-radius: 50%; box-shadow: 2px 2px 5px 0;" src="' + message.author.avatarURL + '"> '+
                    (message.author.bot ?
                        '<span style="background-color: #00004F; color: #FFFFFF; border-radius: 5px; padding: 0 4px 0 4px;">Bot</span>' :
                        '<span style="background-color: #004F00; color: #FFFFFF; border-radius: 5px; padding: 0 4px 0 4px;">User</span>') + ' ' +
                  '<b>' + usr_nick + '</b> <small>(' + usr_sign + ')</small></p>' +
                  '<p><b><u>#' + message.channel.name + '</u></b>@' + message.guild.name + '</p>' +
                  '<p><pre style="border-width: 1px; border-color: #000000; border-style: solid; border-radius: 8px; box-shadow: 2px 2px 5px 0; padding: 10px;">' + escape(args) + '</pre></p>' +
                  '<p><h3>Meta-data</h3></p>' +
                  '<ul>' +
                  '<li> UserID: [' + message.author.id + ']</li>' +
                  '<li> GuildID: [' + message.guild.id + ']</li>' +
                  '<li> ChannelID: [' + message.channel.id + ']</li>' +
                  '</ul>',  //html body
            attachments: extraFiles
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info)
        {
            if(doReply)
            {
                if(error)
                {
                    message.channel.send('Failed to send mail: ' + error).catch(msgSendError);
                    return;
                }
                message.channel.send('Message sent: ' + info.response).catch(msgSendError);
            }
        });
    }).catch(function(err){
        message.reply("Something weird happen! I have catched an error at myself! (error is [" + err +"])", core.msgSendError);
    });
}

function sendEmail(bot, message, args)
{
    //if(inList(emailBlackList, message.author.id))
    if(inListFile("black_email.txt", message.author.id))
    {
        message.channel.send("Sorry, " + message.author.toString() + ", emailing is forbidden for you! (you are in black list!) :cop:").catch(msgSendError);
        return;
    }

    if( (emailWhiteList.length > 0) && !inList(emailWhiteList, message.author.id))
    {
        message.channel.send("Sorry, " + message.author.toString() + ", emailing is forbidden for you! (you are not in white list!) :cop:").catch(msgSendError);
        return;
    }

    sendEmailF(message, args, true);
}

function commandAllowedOnServer(Cmd, gd_ext)
{
    if(Cmd.guildsLimit.length > 0)
    {
        let found = false;
        Cmd.guildsLimit.forEach(function(gd)
        {
            console.log("Compare " + gd_ext + " and " + gd + "...");
            if(gd_ext === gd)
                found = true;
        });
        if(!found)
            return false;
    }
    return true;
}

function listCmds(bot, message, args)
{
    let commands = "**Available commands:**\n";
    let commandsCount = 0;
    let isGuild = (message.channel.type === "text");
    for(const cmdK of Cmds)
    {
        if(!isGuild && (cmdK.guildsLimit.length > 0))
            continue;
        if(isGuild && !commandAllowedOnServer(cmdK, message.guild.id))
            continue;
        if(commandsCount > 0)
            commands += ", ";
        commands += cmdK.name;
        commandsCount++;
    }
    commands += "\n\nTotally I know **" + Cmds.length + "** commands.";
    commands += "\nUnique are **" + CmdsREAL.length + "** commands.";
    commands += "\nAvailable on this chat server **" + commandsCount + "** commands.";
    commands += "\n";
    let usefulCount = 0;
    let usefulCommands = "";
    for(const cmdK of CmdsREAL)
    {
        if(!isGuild && (cmdK.guildsLimit > 0))
            continue;
        if(isGuild && !commandAllowedOnServer(cmdK, message.guild.id))
            continue;
        if(cmdK.isUseful)
        {
            if(usefulCount > 0)
                usefulCommands += ", ";
            usefulCount++;
            usefulCommands += cmdK.name;
        }
    }
    commands += "\nUseful of them are **" + usefulCount + "** commands:\n";
    commands += usefulCommands;

    commands += "\n\nType __**/foxy help <command>**__ to read detail help for specific command.";
    message.channel.send(commands).catch(msgSendError);
}

function cmdHelp(bot, message, args)
{
    let isGuild = (message.channel.type === "text");
    if(args.trim() === "")
    {
        listCmds(bot, message, args);
        return;
    }
    for(const cmdK of Cmds)
    {
        if(cmdK.name === args)
        {
            if(!isGuild && (cmdK.guildsLimit.length > 0))
                continue;
            if(isGuild && !commandAllowedOnServer(cmdK, message.guild.id))
                continue;
            let helpCmd = "\n**" + cmdK.name + "**\n" + cmdK.help + "\n";
            if(cmdK.synonims.length > 0)
            {
                helpCmd += "\n**Aliases**: ";
                for(let j = 0; j < cmdK.synonims.length; j++)
                {
                    if(j > 0) helpCmd += ", ";
                    helpCmd += cmdK.synonims[j];
                }
            }
            message.reply(helpCmd).catch(msgSendError);
            return;
        }
    }
    message.reply("Sorry, I don't know this").catch(msgSendError);
}

function wrongFunction(bot, message, args)
{
    produceShit();
}

function addCMD(cmd)
{
    let cmdEntry = {};
    cmdEntry.name = cmd[CMD_NAME];
    cmdEntry.call = cmd[CMD_FUNCTION];

    if(typeof(cmd[CMD_HELPTEXT]) === 'undefined')
        cmdEntry.help = "<No description>";
    else
        cmdEntry.help = cmd[CMD_HELPTEXT];

    if(typeof(cmd[CMD_SYNONIMS]) === 'undefined')
        cmdEntry.synonims = [];
    else
        cmdEntry.synonims = cmd[CMD_SYNONIMS];

    if(typeof(cmd[CMD_ISUSEFUL]) === 'undefined')
        cmdEntry.isUseful = false;
    else
        cmdEntry.isUseful = cmd[CMD_ISUSEFUL];

    if (typeof (cmd[CMD_LIMIT_ON_GUILDS]) === 'undefined')
        cmdEntry.guildsLimit = [];
    else
        cmdEntry.guildsLimit = cmd[CMD_LIMIT_ON_GUILDS];

    CmdsREAL.push(cmdEntry);
    Cmds.push(cmdEntry);
}

function clearCommands()
{
    CmdsREAL = [];
    Cmds = [];
}

function addSynonimOf(oldCmd, name, customHelp = "")
{
    for(let i = 0; i < CmdsREAL.length; i++)
    {
        if(CmdsREAL[i].name === oldCmd)
        {
            let newI = Cmds.length;
            Cmds[newI] = Object.assign({}, CmdsREAL[i]);
            Cmds[newI].name = name;

            if(customHelp !== "")
                Cmds[newI].help = customHelp;

            if(CmdsREAL[i].synonims.length === 0)
                CmdsREAL[i].synonims.push(oldCmd);
            CmdsREAL[i].synonims.push(name);
            Cmds[newI].synonims = CmdsREAL[i].synonims;
            break;
        }
    }
}

// Command structure: name[0], function(bot,msg,args)[1], help[2], synonims[3], isUseful[4], limitOnGuilds[5]

function registerCommands()
{
    addCMD(["cmd",       listCmds,        "Prints list of available commands"]);
    addSynonimOf("cmd", "cmds");
    addSynonimOf("cmd", "commands");

    addCMD(["test",     test,             "Just a test"]);
    addCMD(["invite",   inviteMeLink,     "I'll give you invite link to me!", [], true]);

    addCMD(["say",      say,              "I'll say some instead you! (attachments also supported!)\n__*Syntax:*__ say <any your text>"]);
    addCMD(["saytts",   sayTTS,           "I'll help to pronuncate you some!\n__*Syntax:*__ saytts <any your text>"]);
    addCMD(["whosaid",  sayLog,           ":spy: Shsh! I'll leak you secret - who asked me to say (5 last messages)\n"]);
    addCMD(["setgame",  setPlayingGame,   "I'll play any game you suggesting me!\n" +
                                                "__*Syntax:*__ setgame <any your text>\n\n**NOTE:** Only permited users can use this command!"]);
    addCMD(["setmusic", setListeningMusic,"I'll listen any music you suggesting me!\n" +
                                          "__*Syntax:*__ setmusic <any your text>\n\n**NOTE:** Only permited users can use this command!"]);
    addCMD(["setvideo", setWatchingVideo, "I'll watch any video suggesting me!\n" +
                                          "__*Syntax:*__ setvideo <any your text>\n\n**NOTE:** Only permited users can use this command!"]);
    addCMD(["setstream",setStreaming,     "I'll stream anything you ask me!\n" +
                                          "__*Syntax:*__ setstream <any your text>\n\n**NOTE:** Only permited users can use this command!"]);

    addCMD(["remind",   sayDelayd,        ":information_desk_person: I'll remeber a thing you request me!\n__*Syntax:*__ remind <any your text> after <time> <seconds, minutes, hours>\n", [], true]);
    addCMD(["remindme", sayDelaydME,      ":information_desk_person: I'll remeber you personally a thing you request me!\n__*Syntax:*__ remindMe <any your text> after <time> <seconds, minutes, hours>\n", [], true]);

    addCMD(["err",      wrongFunction,    "It hurts me..."]);

    addCMD(["isbeepboop",isBeepBoop,      "Check is this server has a beep-boop channel"]);
    addSynonimOf("isbeepboop","isfun",    "Check is this server has a beep-boop/fun channel");

    addCMD(["mytime",   myTime,           "Let's check our watches? :clock: :watch: :stopwatch: :clock1: "]);
    addCMD(["stats",    aboutBot,         "Just my health state"]);
    addSynonimOf("stats", "about",        "Wanna meet me?");
    addCMD(["uptime",   upTimeBot,        "How long I still be here"]);

    addCMD(["help",     cmdHelp,          "Prints help of command"]);

    addCMD(["mailwohlstand", sendEmail,   "Send email to my creator while he is offline. (Attachments are supported!) \n" +
                                          "__*Syntax:*__ mailwohlstand <any your text>", [], true]);

    addCMD(["check-in-list", cachedFiles_Check, "Check the existing of something in one of built-in lists", [], true]);
    addCMD(["reload-lists", cachedFiles_ReLeload, "<Owner-Only> Reload built-in lists", [], true]);


    foxyLogInfo( Cmds.length + " command has been registered!");
}


function callCommand(bot, message, command, args)
{
    if(inListFile("black_global.txt", message.author.id))
        return;

    let isDM = (message.channel.type !== "text");
    let found=false;
    for(const cmdK of Cmds)
    {
        if(cmdK.name === command)
        {
            if(isDM && (cmdK.guildsLimit.length > 0))
                continue;
            if(!isDM && !commandAllowedOnServer(cmdK, message.guild.id))
                continue;
            try{
                found = true;
                cmdK.call(bot, message, args);
            }
            catch(e)
            {
                sendErrorMsg(bot, message.channel, e);
            }
            break;
        }
    }
    if(!found)
    {
        message.reply("Sorry, I don't know this command! " +
            "Type \"" + (botConfig.prefix !== undefined ? botConfig.prefix : "/foxy") + " cmd\"!").catch(msgSendError);
    }
}


module.exports =
{
    cutWord:          cutWord,
    say:              say,

    callCommand:      callCommand,
    registerCommands: registerCommands,
    loginBot:         loginBot,
    cachedFiles_init: cachedFiles_init,
    cachedFiles_loadFile: cachedFiles_loadFile,
    inListFile:       inListFile,
    isWritableGuild:  isWritableGuild,
    isWritableChannel: isWritableChannel,
    isWritableChannelId: isWritableChannelId,
    getDefaultChannelForGuild: getDefaultChannelForGuild,
    sendEmail:        sendEmailF,
    sendEmailFile:    sendEmailFile,
    initRemindWatcher:initRemindWatcher,
    postGreeting:     postGreeting,
    msgSendError:     msgSendError,
    msgDeleteError:   msgDeleteError,
    sendErrorMsg:     sendErrorMsg,
    getMsgText:       getMsgText,
    botConfig:        botConfig,
    my_db:            my_db,
    getRandomInt:     getRandomInt,
    errorMyDb:        errorMyDb,
    foxyLogInfo:      foxyLogInfo,
    foxyLogError:     foxyLogError,
    addCMD:           addCMD,
    addSynonimOf:     addSynonimOf,
    clearCommands:    clearCommands
};

