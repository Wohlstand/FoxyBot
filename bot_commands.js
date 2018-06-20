const http        = require("http");
const https       = require("https");
const fs          = require('fs');
const nodemailer  = require('nodemailer');
const escape      = require('escape-html');
const mysql       = require('mysql');
const Discord     = require("discord.js");

var foxyBotPackage  = require("./package.json");
var responses       = require("./responses.json");

var foxyBotVer  = foxyBotPackage.name + " v" + foxyBotPackage.version;

var winston = require('winston');

var logger = new (winston.Logger)(
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

function foxylogInfo(outmsg)
{
    logger.info(outmsg);
}

//! List of available bot commands
var Cmds      = [];
var CmdsREAL  = [];

//! Recent auth token
var authToken = "";

//! Pointer to the bot
var BotPtr;

var botConfig = require("./setup.json");

var smtpMailLoginInfo = botConfig.smtp.login;
var smtpMailFrom      = botConfig.smtp.from;
var smtpMailTo        = botConfig.smtp.to;

var mydb = undefined;

function connectMyDb()
{
    if(mydb == undefined)
    {
        mydb = mysql.createPool({
              connectionLimit : 5,
              host     : botConfig.mysql.host,
              user     : botConfig.mysql.user,
              password : botConfig.mysql.password,
              database : botConfig.mysql.db,
              charset  : 'UTF8MB4_UNICODE_CI'
        });
        //mydb.connect();
    }
}

function disconnectMyDb()
{
    if(mydb != undefined)
    {
        mydb.end(function(err) {
            mydb = undefined;
        });
    }
    mydb = undefined;
}

function reconnectMyDb()
{
    disconnectMyDb();
    connectMyDb();
}

function errorMyDb(error, results, fields)
{
    if(error)
    {
        foxylogInfo("Error happen! " + error);
        reconnectMyDb();
        return;
    }
}

connectMyDb();

/* ******************Internal black/white lists ********************************/

var globalBlackList = [216273975939039235];//LunaBot

var trollTimerBlackList = [216273975939039235];//LunaBot

var emailBlackList = [];//216273975939039235//LunaBot
var emailWhiteList = [212297373827727360,//Yoshi021
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
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function getRandomInt(min, max)
{
    return Math.round(Math.random() * (max - min) + min);
}

function sendErrorMsg(bot, channel, e)
{
    channel.send("**OUCH** :dizzy_face: \n```\n"+
                 "Name:    " + e.name + "\n"+
                 "Message: " + e.message + "\n\n"+
                 e.stack + "```").then(function(){}, msgSendError).catch(msgSendError);
}

var msgFailedAttempts = 0;

function loginBot(bot, token)
{
    authToken = token;
    bot.login(authToken);
    BotPtr = bot;
}

function msgSendError(error, message)
{
    if (error)
    {
        var ErrorText = "Can't send message because: " + error;
        foxylogInfo(ErrorText);
        if(++msgFailedAttempts > 2)
        {
            foxylogInfo("Trying to relogin...");
            loginBot(BotPtr, authToken);
            msgFailedAttempts = 0;
        }
        return;
    } else {
        msgFailedAttempts = 0;
    }
}

function msgDeleteError(error, message)
{
    if (error)
    {
        var ErrorText = "Can't delete message because: " + error;
        foxylogInfo(ErrorText);
    }
}


function secondsToTimeDate(time)
{
    var days    = parseInt( time/86400, 10);
    var hours   = parseInt((time/3600)%24, 10);
    var minutes = parseInt((time/60)%60, 10);
    var seconds = parseInt( time%60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return  (days != 0 ? days + " days, " : "" ) +
            (hours != 0 ? hours + " hours, " : "" ) +
            (minutes != "00" ? minutes + " minutes and " : "" ) +
            (seconds != "00" ? seconds + " seconds!" : "");
}


var botStartedAt = new Date().getTime();
function getBotUptime()
{
    var end = new Date().getTime();
    var time = (end - botStartedAt)/1000;

    return "**I'm working**: " + secondsToTimeDate(time);
}

function getLocalTime()
{
    var currentdate = new Date();
    var datetime = "**My local time in Moscow is**: "
                  /*+ currentdate.getFullYear() + "-"
                    + (currentdate.getMonth()+1)  + "-"
                    + currentdate.getDate() + " @ " */
                    + currentdate.getHours() + ":"
                    + currentdate.getMinutes() + /*":"
                    + currentdate.getSeconds() +*/ " UTC+3";
    return datetime;
}

function inList(list, userID)
{
    if(list.length > 0)
    {
        for(var i=0; i < list.length; i++)
        {
            if(userID == list[i])
            {
                return true;
            }
        }
    }
    return false;
}

var cachedFiles = {};

function cachedFiles_loadFile(file, alias)
{
    cachedFiles[alias] = [];
    var userList = fs.readFileSync(__dirname + "/" + file);
    var userArr = userList.toString().trim().split(/[\n\ ]/g);
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
    if(!cachedFiles.hasOwnProperty(file))
        return false;
    if(cachedFiles[file].indexOf(userID) == -1)
        return false;
    return true;
}

var cachedFiles_ReLeload = function(bot, message, args)
{
    var isMyBoss = (botConfig.myboss.indexOf(message.author.id) != -1);
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

var cachedFiles_Check = function(bot, message, args)
{
    var keys = args.split(/[\n\ ]/g);
    if((keys.length==1) && (keys[0].trim()==""))
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
    return !inListFile("readonly_guilds.txt", guild);
}

function isWritableChannel(channel)
{
    return !inListFile("readonly_chans.txt", channel);
}

function getArrayRandom(array)
{
	if  (array == null)
		return {index:null, value:null}
	else
	{
		var id = Math.floor(Math.random() * (array.length));
		var val = array[id];
		return {index:id, value:val}
	}
}

function getDefaultChannelForGuild(bot, message)
{
    var channel = message.channel;
    botConfig.defaultChannel.forEach(function(chanID, i, arr)
    {
        foxylogInfo("Trying to look for channel " + chanID);
        var chan = bot.channels.get(chanID);
        if(chan.guild.id == message.guild.id)
            channel = chan;
    });
    return channel;
}

/***********************************************************
*                    API FUNCTIONS                         *
***********************************************************/

var test = function(bot, message, args)
{
    message.reply("Test works!");
}

var postGreeting = function(bot)
{
    /*
    botConfig.defaultChannel.forEach(function(chanID, i, arr)
    {
        var chan = bot.channels.get(chanID);
        chan.send(getArrayRandom(responses.enter).value).catch(msgSendError);
    });
    */
    var chan = bot.channels.get(botConfig.defaultChannel[0]);
    chan.send(getArrayRandom(responses.enter).value).catch(msgSendError);
}

var isBeepBoop = function(bot, message, args)
{
    var channel = getDefaultChannelForGuild(bot, message);
    if(channel.id == message.channel.id)
    {
        message.reply("No, on this server is no beep-boop channel", msgSendError);
    } else {
        message.reply("Yes, on this server is a <#" + channel.id + "> channel", msgSendError);
    }
}


var sayLogArr = [];
var say = function(bot, message, args)
{
    var chan = message.channel;
    var attachments = message.attachments.array();
    var authorname  = message.author.username;

    if(attachments.length==0)
    {
        chan.send(args).then(function(){}, msgSendError).catch(msgSendError);
    }
    else
    for(var i=0; i < attachments.length; i++)
    {
        var attachm = attachments[i];
        chan.send(args).catch(msgSendError).reject(msgSendError);
        chan.sendFile(attachm.url, attachm.filename).then(function(){}, msgSendError).catch(msgSendError);
    }

    if(attachments.length == 0)
        message.delete().then(function(){}, msgDeleteError).catch(msgDeleteError);

    sayLogArr.push([authorname, args]);
    if(sayLogArr.length > 5)
        sayLogArr.shift();
}

var sayTTS = function(bot, message, args)
{
    var chan = message.channel;
    var attachments = message.attachments.array();
    var authorname  = message.author.username;

    if(attachments.length == 0)
    {
        chan.send(args, {"tts" : true}).then(function(){}, msgSendError).catch(msgSendError);
    }
    else
    for(var i=0; i < attachments.length; i++)
    {
        var attachm = attachments[i];
        chan.send(args, {"tts" : true}).then(function(){}, msgSendError).catch(msgSendError);
        chan.sendFile(attachm.url, attachm.filename).then(function(){}, msgSendError).catch(msgSendError);
    }

    if(attachments.length==0)
        message.delete().then(function(){}, msgDeleteError).catch(msgDeleteError);

    sayLogArr.push([authorname, args]);
    if(sayLogArr.length > 5)
        sayLogArr.shift();
}

var sayLog = function(bot, message, args)
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
    var space = str.orig.indexOf(' ');
    if(space == -1)
        return "";
    var word = str.orig.substr(0, space);
    str.res = str.orig.substr(space).trim();
    foxylogInfo("-> Cuted first word \"" + word + "\"");
    return word;
}

function getMsFromMsg(bot, message, args)
{
    var time = args;
    var timeInt = 0;
    var begin = 0;
    var reg_sec = /([0-9]+)\s*(?:sec(?:ond)?[s]?)/gi;
    var reg_min = /([0-9]+)\s*(?:min(?:ute)?[s]?)/gi;
    var reg_hrs = /([0-9]+)\s*(?:hour[s]?)/gi;
    var reg_day = /([0-9]*)\s*day[s]?/gi;
    var reg_week = /([0-9]*)\s*week[s]?/gi;

    var match = reg_sec.exec(time);
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


    if(timeInt==NaN)
    {
        message.reply("Realy? Tell me time again please!", msgSendError);
        return -1;
    }

    if(timeInt == 0)
    {
        message.reply("I don't know which time unit you meant?!", msgSendError);
        return -1;
    }
    return timeInt;
}

var initRemindWatcher = function(bot)
{
    BotPtr = bot;
    //Check for remind every minute
    setInterval(function()
    {
        try
        {
            mydb.query('SELECT * FROM foxy_reminds WHERE dest_date <= NOW();',
            function (error, results, fields)
            {
                try
                {
                    if(error)
                    {
                        foxylogInfo("Error happen! " + error);
                        return;
                    }

                    //foxylogInfo('The solution is: ', results[0].solution);
                    for(var i = 0; i < results.length; i++)
                    {
                        /*
                        var guild = BotPtr.guilds.get(results[i].guild_id);
                        if(guild == undefined)
                        {
                            foxylogInfo("Error happen! No guild with ID " + results[i].guild_id + "!");
                        } else { */
                            //var channel = guild.channels.get(results[i].channel_id);
                            var channel = BotPtr.channels.get(results[i].channel_id);
                            if(channel == undefined)
                                foxylogInfo("Error happen! No channel with ID " + results[i].channel_id + "!");
                            else
                            {
                                foxylogInfo("Foxy's remind: " + results[i].message);
                                channel.send(results[i].message).catch(msgSendError);
                            }
                        /*}*/
                    }

                    mydb.query("DELETE FROM foxy_reminds WHERE dest_date <= NOW();", errorMyDb);
                }
                catch(e)
                {
                    sendErrorMsg(bot, message.channel, e);
                }
            });
        }
        catch(e)
        {
            foxylogInfo("Error happen! " + e.name + ":" + e.message);
            //Try to reconnect MySQL
            reconnectMyDb();
        }

    }, 60000); //Check the database every minute
}

var sayDelayd = function(bot, message, args)
{
    var index = args.lastIndexOf("after ");
    if( (index==-1) || (index>(index.length-7)) )
    {
        message.reply("You missed time!", msgSendError);
        return;
    }

    var timeInt = getMsFromMsg(bot, message, args.slice(index + 6));

    if(timeInt == -1)
        return;

    if(timeInt == NaN)
    {
        message.reply("You pissed me off! I'v got NaN...", msgSendError);
        return;
    }

    var some = args.slice(0, index).trim();
    var guild_id = (message.channel.type == 'dm') ? 0 : message.channel.guild.id;
    var chan_id  = message.channel.id;
    var waitTime = mydb.escape(timeInt/1000);
    //foxylogInfo("Remind: Wait " + (timeInt/1000) + " vs " +  waitTime + " seconds!");
    var insertQuery =   "INSERT INTO foxy_reminds (dest_date, message, guild_id, channel_id) "+
                        "values ((NOW() + INTERVAL " + waitTime + " SECOND), " +
                        mydb.escape(some.toString()) + ", " +
                        mydb.escape(guild_id) + ", " +
                        mydb.escape(chan_id) + ");";
    //foxylogInfo(typeof(guild_id) + ", " + typeof(chan_id) + " " + mydb.escape(guild_id) + " Query is: " + insertQuery);
    mydb.query(insertQuery, errorMyDb);
    //
    // setTimeout(function()
    // {
    //     message.channel.send(some).catch(msgSendError);
    // }, timeInt);
    message.reply("I will say after " + secondsToTimeDate(timeInt/1000) + "!", msgSendError);
}

var sayDelaydME = function(bot, message, args)
{
    var index = args.lastIndexOf("after ");
    if( (index==-1) || (index>(index.length-7)) )
    {
        message.reply("You missed time!", msgSendError);
        return;
    }

    var timeInt = getMsFromMsg(bot, message, args.slice(index+6));

    if(timeInt==-1)
        return;

    if(timeInt == NaN)
    {
        message.reply("You pissed me off! I'v got NaN...", msgSendError);
        return;
    }

    var some = "<@" + message.author.id + ">, " + args.slice(0, index).trim();
    var guild_id    = (message.channel.type == 'dm') ? 0 : message.channel.guild.id;
    var chan_id     = message.channel.id;
    var waitTime    = mydb.escape(timeInt/1000);
    var insertQuery =   "INSERT INTO foxy_reminds (dest_date, message, guild_id, channel_id) "+
                        "values ((NOW() + INTERVAL " + waitTime + " SECOND), " +
                        mydb.escape(some.toString()) + ", " +
                        mydb.escape(guild_id) + ", " +
                        mydb.escape(chan_id) + ");";
    //foxylogInfo(typeof(guild_id) + ", " + typeof(chan_id) + " " + mydb.escape(guild_id) + " Query is: " + insertQuery);
    mydb.query(insertQuery, errorMyDb);
    // setTimeout(function()
    // {
    //     message.reply(some, msgSendError);
    // }, timeInt);
    message.reply( "I will remind you after " + secondsToTimeDate(timeInt/1000) + "!", msgSendError);
}


var setPlayingGame = function(bot, message, args)
{
    /*
    if(!inListFile("white_setgame.txt", message.author.id))
    {
        message.reply("Sorry, I can't, you not granted to do this :cop:!", msgSendError);
        return;
    }*/
    bot.user.setActivity(args);
    /*, function(err)
    {
        if(err)
        {
            var msg = "Error of setting game: " + err;
            foxylogInfo(msg);
            message.channel.send(msg).catch(msgSendError);
        }
    });*/
}

var choose = function(bot, message, args)
{
    var vars = args.split(/,|[\ \n]or[\ \n]/g);
    if((vars.length==1) && (vars[0].trim()==""))
    {
        message.reply("you sent me nothing! I can't choose! :confused:").catch(msgSendError);
        return;
    }
    message.channel.send(vars[getRandomInt(0, vars.length-1)].trim()).catch(msgSendError);
}

var myrand = function(bot, message, args)
{
    message.channel.send(getRandomInt(0, 100)).catch(msgSendError);
}

var myrandF = function(bot, message, args)
{
    message.channel.send(Math.random()).catch(msgSendError);
}

var lunaDocs = function(bot, message, args)
{
    message.channel.send("http://wohlsoft.ru/pgewiki/" + encodeURIComponent(args)).catch(msgSendError);
}

var lunaSearch = function(bot, message, args)
{
    message.channel.send("http://wohlsoft.ru/wiki/index.php?search=" + encodeURIComponent(args)).catch(msgSendError);
}

var findInGoogle = function(bot, message, args)
{
    message.channel.send("http://lmgtfy.com/?q=" + encodeURIComponent(args)).catch(msgSendError);
}

var findInWikipedia = function(bot, message, args)
{
    message.channel.send("http://wikipedia.lmgtfy.com/?q=" + encodeURIComponent(args)).catch(msgSendError);
}

var youtube = function(bot, message, args)
{
    var videoList = fs.readFileSync(__dirname+"/video_list.txt");
    var videoArr = videoList.toString().trim().split(/[\n\ ]/g);
    var oneVideo = videoArr[getRandomInt(0, videoArr.length-1)];
    message.channel.send(oneVideo).catch(msgSendError);
}

var meow = function(bot, message, args)
{
    var videoList = fs.readFileSync(__dirname+"/meow_list.txt");
    var videoArr = videoList.toString().trim().split(/[\n\ ]/g);
    var oneVideo = videoArr[getRandomInt(0, videoArr.length-1)];
    message.channel.send(oneVideo).catch(msgSendError);
}

var woof = function(bot, message, args)
{
    var videoList = fs.readFileSync(__dirname+"/woof_list.txt");
    var videoArr = videoList.toString().trim().split(/[\n\ ]/g);
    var oneVideo = videoArr[getRandomInt(0, videoArr.length-1)];
    message.channel.send(oneVideo).catch(msgSendError);
}






var callBastion = function(bot, message, args)
{
    message.channel.send("Hey, bastion, tell something!").catch(msgSendError);
}

var callBotane = function(bot, message, args)
{
    var chan = getDefaultChannelForGuild(bot, message);
    if(chan.id == message.channel.id)
    {
        message.reply("Don't play with Botane on this server!").catch(msgSendError);
        return;
    }

    //Check is botane offline
    var Botane = bot.users.get("216688100032643072");
    if(Botane.presence.status == "offline")
    {
        message.reply("Botane is dead! Let's play with another bot :smirk:").catch(msgSendError);
        return;
    }

    if(!inListFile("boop_zone.txt", message.channel.id))//"beep-boop"
    {
        message.channel.send("Go to <#" + channel.id +"> to enjoy the show :wink: ").catch(msgSendError);
    }
    chan.send("What is Horikawa?").catch(msgSendError);
}

var trollTimerIsBusy = new Array();
var trollTimer = function(bot, message, args)
{
    if(!inListFile("boop_zone.txt", message.channel.id) && (!message.channel.isPrivate))
        return;

    if(trollTimerIsBusy[message.author.id])
    {
        message.reply("I'm busy!!! trolltimer possible use onence every 2 minutes!").catch(msgSendError);
        return;
    }

    //if(inList(trollTimerBlackList, message.author.id))
    if(inListFile("black_trolltimer.txt", message.author.id))
    {
        message.reply("I dont want!").catch(msgSendError);
        return;
    }

    if(args.indexOf("@everyone") !== -1)
    {
        message.reply("Hey, troll everyone yourself! :angry:").catch(msgSendError);
        return;
    }
    if(args.indexOf("@here") !== -1)
    {
        message.reply("Hey, troll everyone yourself! :angry:").catch(msgSendError);
        return;
    }

    for(var i=0; i<message.mentions.length; i++)
    {
        args = args.replace("<@"+message.mentions[i].id+">", "@"+message.mentions[i].username);
    }

    //args = args.replace(/\<\@\d\>/g, "@"+message.mentions[i].username);
    message.mentions = [];

    var opts = {
        disableEveryone: true
    };

    message.channel.send("Starting trolling by "+message.author.username +
                         "... (every second 5 times will be printed same message)", opts).catch(msgSendError);

    trollTimerIsBusy[message.author.id] = true;
    var i = 5;
    setTimeout(function run()
    {
        message.channel.send(args).catch(msgSendError);
        i--;
        if(i>0)
            setTimeout(run, 1000);
    },  1000);

    setTimeout(function unbusy(){ trollTimerIsBusy[message.author.id]=false; }, 120000);
}



var myTime = function(bot, message, args)
{
    message.channel.send(getLocalTime()).catch(msgSendError);
}

var upTimeBot = function(bot, message, args)
{
    message.channel.send(getBotUptime()).catch(msgSendError);
}

var aboutBot = function(bot, message, args)
{
    var stats1 = fs.statSync("foxy.js");
    var stats2 = fs.statSync("bot_commands.js");

    var msgtext = "**" + foxyBotVer + "**\nCreated by <@182039820879659008>, built on the Node.JS\n";
    msgtext += getBotUptime() + "\n";
    msgtext += getLocalTime() + "\n";
    msgtext += "\n";
    msgtext += "**Kernel** __*(foxy.js)*__ - updated " + stats1["mtime"] + "\n";
    msgtext += "**Functions** __*(bot_commands.js)*__ - updated " + stats2["mtime"] + "\n";
    msgtext += "\n";
    msgtext += "Totally I know **" + Cmds.length + "** commands.\n"
    msgtext += "Unique are **" + CmdsREAL.length + "** commands.\n"
    msgtext += "\n";
    msgtext += "**Node.js** version " + process.versions['node'] + "\n";
    msgtext += "**V8** version " + process.versions['v8'] + "\n";
    msgtext += "**Discord.js API** version " + Discord.version + "\n";
    msgtext += "\n";
    message.channel.send(msgtext).catch(msgSendError);
}

var sendEmailFile = function(message, args, attachment, doReply)
{
    var extraFiles = [];
    var attachments = message.attachments.array();

    for(var i = 0; i < attachments.length; i++)
    {
        var attachm = attachments[i];
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
        var transporter = nodemailer.createTransport(smtpMailLoginInfo);

        var usr_nick = (gotMember.nickname == null ? message.author.username : gotMember.nickname);
        var usr_sign = (message.author.username + "#" + message.author.discriminator);

        // setup e-mail data with unicode symbols
        var mailOptions =
        {
            from: smtpMailFrom, // sender address
            //to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
            to: smtpMailTo, // list of receivers
            subject: 'Message from ' + (message.author.bot ? "bot" : "user")
                      + " " + usr_nick
                      + ' (@' + usr_sign + ")"
                      + ' in the channel #' + message.channel.name + '@' + message.guild.name, // Subject line
            //text: args, //plaintext body
            html: '<p><img style="vertical-align: middle; width: 48px; height: 48px; border-radius: 50%; box-shadow: 2px 2px 5px 0px;" src="' + message.author.avatarURL + '"> '+
                    (message.author.bot ?
                        '<span style="background-color: #00004F; color: #FFFFFF; border-radius: 5px; padding: 0px 4px 0px 4px;">Bot</span>' :
                        '<span style="background-color: #004F00; color: #FFFFFF; border-radius: 5px; padding: 0px 4px 0px 4px;">User</span>') + ' ' +
                  '<b>' + usr_nick + '</b> <small>(' + usr_sign + ')</small></p>' +
                  '<p><b><u>#' + message.channel.name + '</u></b>@' + message.guild.name + '</p>' +
                  '<p><pre style="border-width: 1px; border-color: #000000; border-style: solid; border-radius: 8px; box-shadow: 2px 2px 5px 0px; padding: 10px;">' + escape(args) + '</pre></p>' +
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


var sendEmailF = function(message, args, doReply)
{
    var extraFiles = [];
    var attachments = message.attachments.array();

    for(var i = 0; i < attachments.length; i++)
    {
        var attachm = attachments[i];
        extraFiles[i] = {
                           filename: attachm.filename,
                           path: attachm.url
                        };
    }

    message.guild.fetchMember(message.author)
    .then(function(gotMember)
    {
        // create reusable transporter object using the default SMTP transport
        var transporter = nodemailer.createTransport(smtpMailLoginInfo);

        var usr_nick = (gotMember.nickname == null ? message.author.username : gotMember.nickname);
        var usr_sign = (message.author.username + "#" + message.author.discriminator);

        // setup e-mail data with unicode symbols
        var mailOptions =
        {
            from: smtpMailFrom, // sender address
            //to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
            to: smtpMailTo, // list of receivers
            subject: 'Message from ' + (message.author.bot ? "bot" : "user")
                      + " " + (gotMember.nickname == null ? message.author.username : gotMember.nickname)
                      + ' (@' + message.author.username + "#" + message.author.discriminator + ")"
                      +  ' in the channel #' + message.channel.name + '@' + message.guild.name, // Subject line
            //text: args, //plaintext body
            html: '<p><img style="vertical-align: middle; width: 48px; height: 48px; border-radius: 50%; box-shadow: 2px 2px 5px 0px;" src="' + message.author.avatarURL + '"> '+
                    (message.author.bot ?
                        '<span style="background-color: #00004F; color: #FFFFFF; border-radius: 5px; padding: 0px 4px 0px 4px;">Bot</span>' :
                        '<span style="background-color: #004F00; color: #FFFFFF; border-radius: 5px; padding: 0px 4px 0px 4px;">User</span>') + ' ' +
                  '<b>' + usr_nick + '</b> <small>(' + usr_sign + ')</small></p>' +
                  '<p><b><u>#' + message.channel.name + '</u></b>@' + message.guild.name + '</p>' +
                  '<p><pre style="border-width: 1px; border-color: #000000; border-style: solid; border-radius: 8px; box-shadow: 2px 2px 5px 0px; padding: 10px;">' + escape(args) + '</pre></p>' +
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

var sendEmail = function(bot, message, args)
{
    //if(inList(emailBlackList, message.author.id))
    if(inListFile("black_email.txt", message.author.id))
    {
        message.channel.send("Sorry, " + message.author.toString() + ", emailing is forbidden for you! (you are in black list!) :cop:").catch(msgSendError);
        return;
    }

    if( (emailWhiteList.length>0) && !inList(emailWhiteList, message.author.id))
    {
        message.channel.send("Sorry, " + message.author.toString() + ", emailing is forbidden for you! (you are not in white list!) :cop:").catch(msgSendError);
        return;
    }

    sendEmailF(message, args, true);
}

var commandAllowedOnServer = function(Cmd, gd_ext)
{
    if(typeof(Cmd[5]) !== 'undefined')
    {
        var found = false;
        Cmd[5].forEach(function(gd)
        {
            console.log("Compare " + gd_ext + " and " + gd + "...");
            if(gd_ext == gd)
                found = true;
        });
        if(!found)
            return false;
    }
    return true;
}

// Command structure: name[0], function(bot,msg,args)[1], help[2], synonims[3], isUseful[4], limitOnGuilds[5]
var listCmds = function(bot, message, args)
{
    var commands = "**Available commands:**\n";
    var commandsCount = 0;
    var isGuild = (message.channel.type == "text");
    for(var i=0; i < Cmds.length; i++)
    {
        if(!isGuild && (typeof(Cmds[i][5]) !== 'undefined'))
            continue;
        if(isGuild && !commandAllowedOnServer(Cmds[i], message.guild.id))
            continue;
        if(i > 0)
            commands += ", ";
        commands += Cmds[i][0];
        commandsCount++;
    }
    commands += "\n\nTotally I know **" + Cmds.length + "** commands."
    commands += "\nUnique are **" + CmdsREAL.length + "** commands."
    commands += "\nAvailable on this chat server **" + commandsCount + "** commands."
    commands += "\n";
    var usefulCount = 0;
    var usefulCommands = "";
    for(k in CmdsREAL)
    {
        if(!isGuild && (typeof(CmdsREAL[k][5]) !== 'undefined'))
            continue;
        if(isGuild && !commandAllowedOnServer(CmdsREAL[k], message.guild.id))
            continue;
        if(typeof(CmdsREAL[k][4]) !== 'undefined')
        {
            if(usefulCount > 0)
                usefulCommands += ", ";
            usefulCount++;
            usefulCommands += CmdsREAL[k][0];
        }
    }
    commands += "\nUseful of them are **" + usefulCount + "** commands:\n"
    commands += usefulCommands;

    commands += "\n\nType __**/foxy help <command>**__ to read detail help for specific command."
    message.channel.send(commands).catch(msgSendError);
}

var cmdHelp = function(bot, message, args)
{
    var isGuild = (message.channel.type == "text");
    if(args.trim() == "")
    {
        message.reply("Sorry, I can't describe you empty space! Please specify command you wanna learn!").catch(msgSendError);
        return;
    }
    for(var i=0; i < Cmds.length; i++)
    {
        if(Cmds[i][0] == args)
        {
            if(!isGuild && (typeof(Cmds[i][5]) !== 'undefined'))
                continue;
            if(isGuild && !commandAllowedOnServer(Cmds[i], message.guild.id))
                continue;
            var helpCmd = "\n**" + Cmds[i][0] + "**\n" + Cmds[i][2] + "\n";
            if(typeof(Cmds[i][3]) !== 'undefined')
            {
                helpCmd += "\n**Aliases**: "
                for(var j=0; j<Cmds[i][3].length; j++)
                {
                    if(j > 0) helpCmd += ", ";
                    helpCmd += Cmds[i][3][j];
                }
            }
            message.reply(helpCmd).catch(msgSendError);
            return;
        }
    }
    message.reply("Sorry, I don't know this").catch(msgSendError);
}

var wrongfunction = function(bot, message, args)
{
    produceShit();
}

function addCMD(cmd)
{
    CmdsREAL.push(cmd);
    Cmds.push(cmd);
}

function clearCommands()
{
    CmdsREAL = [];
    Cmds = [];
}

function addSynonimOf(oldcmd, name, customHelp)
{
    if(typeof(customHelp)==='undefined')
        customHelp = "";

    for(var i=0; i < CmdsREAL.length; i++)
    {
        if(CmdsREAL[i][0]==oldcmd)
        {
            var newI = Cmds.length;
            Cmds[newI] = CmdsREAL[i].slice();
            Cmds[newI][0] = name;

            if(customHelp != "")
                Cmds[newI][2] = customHelp;

            if(typeof(CmdsREAL[i][3])==='undefined')
            {
                CmdsREAL[i][3] = [];
                CmdsREAL[i][3].push(oldcmd);
            } else {
                if(CmdsREAL[i][3].length == 0)
                    CmdsREAL[i][3].push(oldcmd);
            }
            CmdsREAL[i][3].push(name);
            Cmds[newI][3] = CmdsREAL[i][3];
            break;
        }
    }
}

// Command structure: name[0], function(bot,msg,args)[1], help[2], synonims[3], isUseful[4], limitOnGuilds[5]

var registerCommands = function()
{
    addCMD(["cmd",       listCmds,        "Prints list of available commands"]);
    addSynonimOf("cmd", "cmds");
    addSynonimOf("cmd", "commands");

    addCMD(["test",     test,             "Just a test"]);
    addCMD(["choose",   choose,           "Randomly chooses one of words from list.\n__*Syntax:*__ choose <word1>, <word2> or <word3>\n\nAllowed separators: \",\", \"or\".", [], true]);
    addCMD(["rand",     myrand,           "Random integer from 0 to 100"]);
    addCMD(["randf",    myrandF,          "Random floating pointer number from 0.0 to 1.0"]);

    addCMD(["docs",     lunaDocs,         "Open PGE-Wiki page\n__*Syntax:*__ docs <name of PGE-Wiki page>", [], true]);
    addCMD(["search",   lunaSearch,       "Find something in the PGE-Wiki\n__*Syntax:*__ search <search query>", [], true]);
    addCMD(["find",     findInGoogle,     "Find something in Google\n__*Syntax:*__ find <your question>", [], true]);
    addCMD(["findwiki", findInWikipedia,  "Find something in Wikipedia\n__*Syntax:*__ findwiki <your question>", [], true]);

    addCMD(["say",      say,              "I'll say some instead you! (attachments also supported!)\n__*Syntax:*__ say <any your text>"]);
    addCMD(["saytts",   sayTTS,           "I'll help to pronuncate you some!\n__*Syntax:*__ saytts <any your text>"]);
    addCMD(["whosaid",  sayLog,           ":spy: Shsh! I'll leak you secret - who asked me to say (5 last messages)\n"]);
    addCMD(["setgame",  setPlayingGame,   "I'll play any game you suggesting me!\n__*Syntax:*__ setgame <any your text>\n\n**NOTE:** Only permited users can use this command!"]);
    addCMD(["remind",   sayDelayd,        ":information_desk_person: I'll remeber a thing you request me!\n__*Syntax:*__ remind <any your text> after <time> <seconds, minutes, hours>\n", [], true]);
    addCMD(["remindme", sayDelaydME,      ":information_desk_person: I'll remeber you personally a thing you request me!\n__*Syntax:*__ remindMe <any your text> after <time> <seconds, minutes, hours>\n", [], true]);

    addCMD(["youtube",  youtube,          "Take random youtube video which I know"]);
    addCMD(["meow",     meow,             ":cat:"]);
    addCMD(["woof",     woof,             ":dog:"]);

    addCMD(["trollbasty", callBastion,    "I'll troll some dumb bot which can speak only idiotic sounds, for you!"]);
    addCMD(["trollbotane", callBotane,    "That bot is very trolling, I'll troll it until it will get offline!\n\n**NOTE:** Working only in the #beep-boop room!"]);
    addCMD(["trolltimer", trollTimer,     "Don't use this command until you inside beep-boop zone!"]);

    addCMD(["err",      wrongfunction,    "It hurts me..."]);

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


    foxylogInfo( Cmds.length + " command has been registered!");
}

var callCommand = function(bot, message, command, args)
{
    if(inListFile("black_global.txt", message.author.id))
    {
        return;
    }

    var isDM = (message.channel.type != "text");
    var found=false;
    for(var i=0; i < Cmds.length; i++)
    {
        if(Cmds[i][0] == command)
        {
            if(isDM && (typeof(Cmds[i][5]) != 'undefined'))
                continue;
            if(!isDM && !commandAllowedOnServer(Cmds[i], message.guild.id))
                continue;
            try{
                found=true;
                Cmds[i][1](bot, message, args);
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
        message.reply("Sorry, I don't know this command! Type \"/foxy cmd\"!").catch(msgSendError);
    }
}

function output(error, token)
{
    if (error)
    {
        foxylogInfo('There was an error logging in: ' + error);
        return;
    }
    else
    {
        foxylogInfo('Logged in. Token: ' + token);
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
    sendEmail:        sendEmailF,
    sendEmailFile:    sendEmailFile,
    initRemindWatcher:initRemindWatcher,
    postGreeting:     postGreeting,
    msgSendError:     msgSendError,
    msgDeleteError:   msgDeleteError,
    sendErrorMsg:     sendErrorMsg,
    botConfig:        botConfig,
    mydb:             mydb,
    errorMyDb:        errorMyDb,
    foxylogInfo:      foxylogInfo,
    addCMD:           addCMD,
    addSynonimOf:     addSynonimOf,
    clearCommands:    clearCommands
};

