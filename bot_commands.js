
var http  = require("http");
var https = require("https");
var Datastore = require('nedb');

var fs          = require('fs');

var nodemailer  = require('nodemailer');
var YandexTranslator = require('yandex.translate');
var mysql       = require('mysql');

var foxyBotPackage = require("./package.json");

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

var translator = new YandexTranslator(botConfig.trkey);

var mydb = mysql.createConnection({
      host     : botConfig.mysql.host,
      user     : botConfig.mysql.user,
      password : botConfig.mysql.password,
      database : botConfig.mysql.db,
      charset  : 'UTF8MB4_UNICODE_CI'
});

mydb.connect();

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
    channel.sendMessage("**OUCH** :dizzy_face: \n```\n"+
                        "Name:    " + e.name + "\n"+
                        "Message: " + e.message + "\n\n"+
                        e.stack + "```");
}

var msgFailedAttempts = 0;

function msgSendError(error, message)
{
    if (error)
    {
        var ErrorText = "Can't send message because: " + error;
        foxylogInfo(ErrorText);
        if(++msgFailedAttempts > 2)
        {
            BotPtr.logout(function()
            {
                foxylogInfo("Trying to relogin...");
                loginBot(BotPtr, authToken);
                //setTimeout(function() { BotPtr.sendMessage(message.channel, ErrorText); }, 3000 );
            });
            msgFailedAttempts = 0;
        }
        return;
    } else {
        msgFailedAttempts = 0;
    }
}

function getJSON(options, onResult)
{
    //foxylogInfo("rest::getJSON");
    var prot = options.port == 443 ? https : http;
    var req = prot.request(options,
    function(res)
    {
        var output = '';
        //foxylogInfo(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    }).on('error', (err)=> {
        //res.send('error: ' + err.message);
    });
    req.end();
};

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
    if(list.length>0)
    {
        for(var i=0; i<list.length; i++)
        {
            if(userID == list[i])
            {
                return true;
            }
        }
    }
    return false;
}

function inListFile(file, userID)
{
    var userIDstr = userID.toString();
    var userList = fs.readFileSync(__dirname+"/"+file);
    var userArr = userList.toString().trim().split(/[\n\ ]/g);
    for(var i=0; i<userArr.length; i++)
    {
        if(userArr[i]==userIDstr)
            return true;
    }
    return false;
}

function getRandFile(bot, message, fromURL)
{
    var options = {
        host: 'wohlsoft.ru',
        port: 80,
        path: '/images/foxybot/' + fromURL,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    getJSON(options,
    function(statusCode, result)
    {
        try{
            var randfox = eval(result);
            message.channel.sendMessage(randfox.file, msgSendError);
        }catch(e){
            sendErrorMsg(bot, message.channel, e);
            message.channel.sendMessage("```\nonResult: (" + statusCode + ")" + JSON.stringify(result) + "\n```", msgSendError);
        }
    });
}

/***********************************************************
*                    API FUNCTIONS                         *
***********************************************************/

var test = function(bot, message, args)
{
    message.reply("Test works!");
}

var fox = function(bot, message, args)
{
    getRandFile(bot, message, "randomfox.php");
}

var boxy = function(bot, message, args)
{
    getRandFile(bot, message, "randombox.php");
}

var boat = function(bot, message, args)
{
    getRandFile(bot, message, "randomboat.php");
}

var ship = function(bot, message, args)
{
    getRandFile(bot, message, "randomship.php");
}

var flower = function(bot, message, args)
{
    getRandFile(bot, message, "randomflower.php");
}

var burn = function(bot, message, args)
{
    getRandFile(bot, message, "randomburn.php");
}

var money = function(bot, message, args)
{
    getRandFile(bot, message, "randomoney.php");
}

var lego = function(bot, message, args)
{
    getRandFile(bot, message, "randomlego.php");
}

var fart = function(bot, message, args)
{
    /* Inside moderator channel, take log file */
    if((message.channel.id == "215662579161235456") && (args == "debuglog"))
    {
        message.channel.sendFile("./foxybot-debug.log", "foxybot-debug.log").catch(msgSendError);
        return;
    }

    getRandFile(bot, message, "randomfart.php");
}

var smile = function(bot, message, args)
{
    getRandFile(bot, message, "randomsmile.php");
}

var makeMe = function(bot, message, args)
{
    var argsL = args.toLowerCase();

    if(args.trim() == "")
        message.reply("Sorry, I can't: you wasn't told what I must do!", msgSendError);

    if(argsL.indexOf("ship")!=-1)
        ship(bot, message, args);

    if(argsL.indexOf("boat")!=-1)
        boat(bot, message, args);

    if(argsL.indexOf("fire")!=-1)
        burn(bot, message, args);

    if(argsL.indexOf("fox")!=-1)
        fox(bot, message, args);

    if(argsL.indexOf("lego")!=-1)
        lego(bot, message, args);

    if(argsL.indexOf("box")!=-1)
        boxy(bot, message, args);

    if(argsL.indexOf("flower")!=-1)
        flower(bot, message, args);

    if((argsL.indexOf("money") != -1) || (argsL.indexOf("coin") != -1) || (argsL.indexOf("cash") != -1))
        money(bot, message, args);

    if(argsL.indexOf("elephant")!=-1)
        message.channel.sendMessage(":elephant:", msgSendError);

    if((argsL.indexOf("police") != -1) || (argsL.indexOf("cop") != -1))
        message.channel.sendMessage(":cop:", msgSendError);

    if((argsL.indexOf("butt") != -1) || (argsL.indexOf("ass") != -1))
        message.channel.sendMessage("`(_|_)`", msgSendError);

    if( (argsL.indexOf("fart") != -1) ||
        (argsL.indexOf("gas") != -1)  ||
        (argsL.indexOf("smoke") != -1) ||
        (argsL.indexOf("stink") != -1) ||
        (argsL.indexOf("smell") != -1) )
        fart(bot, message, args);

    if( (argsL.indexOf("crap") != -1) ||
        (argsL.indexOf("dung") != -1) ||
        (argsL.indexOf("shit") != -1) ||
        (argsL.indexOf("poop") != -1) )
        message.channel.sendMessage(":poop:", msgSendError);

    if( (argsL.indexOf("sex") != -1) ||
        (argsL.indexOf("fuck") != -1) ||
        (argsL.indexOf("dick") != -1) ||
        (argsL.indexOf("vagina") != -1) ||
        (argsL.indexOf("penis") != -1) ||
        (argsL.indexOf("pennis") != -1) ||
        (argsL.indexOf("cunt") != -1) ||
        (argsL.indexOf("porn") != -1))
        message.reply("Never, you are stupid pervent! You are worst person I know here!", msgSendError);
}

var burns = function(bot, message, args)
{
    message.channel.sendMessage("https://www.youtube.com/watch?v=gSzgNRzpjo8", msgSendError);
}

var spit = function(bot, message, args)
{
    if(args.indexOf("hot fire")!=-1)
    {
        burn(bot, message, args);
    } else {
        message.channel.sendMessage("https://www.youtube.com/results?search_query=" + encodeURIComponent("Spit " + args), msgSendError);
    }
}

var foxFace = function(bot, message, args)
{
    message.channel.sendMessage("http://wohlsoft.ru/images/foxybot/fox_face.png", msgSendError);
}


var sayLogArr = [];
var say = function(bot, message, args)
{
    var chan = message.channel;
    var attachments = message.attachments.array();
    var authorname  = message.author.username;

    if(attachments.length==0)
    {
        chan.sendMessage(args).catch(msgSendError);
    }
    else
    for(var i=0; i < attachments.length; i++)
    {
        var attachm = attachments[i];
        chan.sendMessage(args).catch(msgSendError);
        chan.sendFile(attachm.url, attachm.filename).catch(msgSendError);
    }

    if(attachments.length==0)
        message.delete();

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
        chan.sendMessage(args, {"tts" : true}).catch(msgSendError);
    }
    else
    for(var i=0; i < attachments.length; i++)
    {
        var attachm = attachments[i];
        chan.sendMessage(args, {"tts" : true}).catch(msgSendError);
        chan.sendFile(attachm.url, attachm.filename).catch(msgSendError);
    }

    if(attachments.length==0)
        message.delete();

    sayLogArr.push([authorname, args]);
    if(sayLogArr.length > 5)
        sayLogArr.shift();
}

var sayLog = function(bot, message, args)
{
    if(sayLogArr.length > 0)
    {
        var whoTold="";
        for(var i=0; i<sayLogArr.length; i++)
        {
            whoTold += sayLogArr[i][0] + " told \"" + sayLogArr[i][1] + "\"\n";
        }
        message.channel.sendMessage(whoTold, msgSendError);
    } else {
        message.channel.sendMessage("No sayd phrases :weary:", msgSendError);
    }
}


var votingDb = new Datastore({filename : 'votings', autoload: true});
var votesDb  = new Datastore({filename : 'votes', autoload: true});

var votingVotings = new Array();

function countVotes(chid)
{
    var votingResult = [];
    var votingResultMsg = "";
    if(Object.size(votingVotings[chid].voters) == 0)
    {
        votingResultMsg = "No one voted :confused:";
    } else {
        var voters = votingVotings[chid].voters;
        for(var i=0; i<votingVotings[chid].votingVariants.length; i++)
        {
            votingResult[i] = new Array();
            votingResult[i].title = votingVotings[chid].votingVariants[i];
            votingResult[i].votes = 0;
        }
        for(v in voters)
        {
            var voteTo = voters[v];
            votingResult[voteTo].votes += 1;
        }
        for(i in votingResult)
        {
            votingResultMsg += (parseInt(i, 10)+1) + ") " + votingResult[i].title + " --> **" + votingResult[i].votes + "**\n";
        }
    }
    return votingResultMsg;
}

var voting = function(bot, message, args)
{
    var chid = message.channel.id;
    if(typeof(votingVotings[message.channel.id])==='undefined')
    {
        votingVotings[chid] = new Array();
        votingVotings[chid].votingInProcess = false;
    }
    foxylogInfo("====Voting mechanism====");
    //on "start <variants>" begin vote counts
    if(args.indexOf("start ") != -1)
    {
        foxylogInfo("--start--");
        if(votingVotings[chid].votingInProcess)
        {
            message.reply("Another voting in process! Finish this voting and then you will be able to start new one!", msgSendError);
            return;
        }
        var variants = args.slice(6);
        if(variants.trim()=="")
        {
            message.reply("Nothing to vote!", msgSendError);
            return;
        }
        votingVotings[chid].voters = [];//If user is here - ignore next votes. Revoting is not allowed
        votingVotings[chid].votingVariants = variants.split(";");
        var voteMsg = "**Voting variants:**\n"
        for(var i=0;i<votingVotings[chid].votingVariants.length; i++)
        {
            votingVotings[message.channel.id].votingVariants[i] = votingVotings[chid].votingVariants[i].trim();
            voteMsg += " **" + (i+1) + ")** " + votingVotings[chid].votingVariants[i] + "\n";
        }

        votingVotings[chid].votingInProcess = true;
        message.channel.sendMessage("Voting started!\n\n" + voteMsg, msgSendError);
    }
    //on "stats" show result
    else
    if(args.indexOf("stats") != -1)
    {
        foxylogInfo("--stats--");
        if(!votingVotings[chid].votingInProcess)
        {
            message.channel.sendMessage("No votings in this channel! Type **/foxy help voting** to learn how to work with voting.", msgSendError);
            return;
        }
        var votingResultMsg = countVotes(chid);
        message.channel.sendMessage("**Current voting state**:\n" + votingResultMsg, msgSendError);
    }
    //on "stop" abort voting process and show result
    else
    if((args.indexOf("stop") != -1) || (args.indexOf("end") != -1))
    {
        foxylogInfo("--stop--");
        if(!votingVotings[chid].votingInProcess)
        {
            message.reply("No voting in this channel to stop!", msgSendError);
            return;
        }
        votingVotings[chid].votingInProcess = false;
        var votingResultMsg = countVotes(chid);
        message.channel.sendMessage("**Voting stopped!**\n" + votingResultMsg, msgSendError);
    } else {
    //on "<number of variant>" add voter
        foxylogInfo("--vote--");
        if(!votingVotings[chid].votingInProcess)
        {
            message.reply("No votings to vote! Type **/foxy help voting** to learn how to work with voting.", msgSendError);
            return;
        }
        foxylogInfo("Got vote: " + args.trim() );
        var vote = parseInt(args.trim(), 10);
        if( (vote != NaN) )
        {
            if( (vote > 0) && (vote <= votingVotings[chid].votingVariants.length) )
            {
                foxylogInfo("Vote remembered: " + vote);
                votingVotings[chid].voters[message.author.id] = (vote-1);
            } else {
                message.reply("Out of range!, Vote variant from 1 to " + (votingVotings[chid].votingVariants.length), msgSendError);
            }
        } else {
            //foxylogInfo("Vote invalid: " + vote);
            message.reply("Unknown command! Accepted commands are **start**, **stats**, **stop**, or integer of the variant!", msgSendError);
        }
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

//var langReg = new RegExp("/^\[([a-z]){2}\&]/ig", "ig");
function isLanguage(word)
{
    return /^\[([a-z]){2}\]$/ig.test(word.trim());
}

var langChannels =
{
    "263203404954730498": "ru",
    "263203433706684416": "ja",
    "263203445035499520": "es",
    "263392784117923841": "pt"
}

var translate = function(bot, message, args)
{
    var phraze = { orig: args, res: "..."};
    var arg1 = cutWord(phraze);
    if(!isLanguage(arg1))
    {
        //Detect channel specific language
        var chID = message.channel.id;
        if(langChannels[chID] != undefined)
            arg1 = langChannels[chID];
        else
            arg1 = 'en';
        phraze.res = phraze.orig;
        foxylogInfo("-> Using channel language...");
    }
    else
    {
        arg1 = arg1.substr(1, 2);
    }

    if(phraze.res == "")
    {
        message.reply("Can't translate nothing!");
        return;
    }

    foxylogInfo("-> Translate into " + arg1 + " the phraze " + phraze.res);
    translator.translate(phraze.res, arg1)
    .then(function(translation)
    {
        foxylogInfo(translation);
        if(message.editable)
        {
            message.edit(translation);
        } else {
            say(bot, message,  "<@!" + message.author.id + ">: " + translation);
        }
    },
    function(fail)
    {
        message.reply("Can't translate: " + fail, msgSendError);
    }).catch(msgSendError);
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
                                channel.sendMessage(results[i].message, msgSendError);
                            }
                        /*}*/
                    }

                    mydb.query("DELETE FROM foxy_reminds WHERE dest_date <= NOW();",
                    function (error, results, fields)
                    {
                        if(error)
                        {
                            foxylogInfo("Error happen! " + error);
                            return;
                        }
                    });
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
    mydb.query(insertQuery,
    function (error, results, fields)
    {
        if(error)
        {
            foxylogInfo("Error happen! " + error);
            return;
        }
    });
    //
    // setTimeout(function()
    // {
    //     message.channel.sendMessage(some, msgSendError);
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
    mydb.query(insertQuery,
    function (error, results, fields)
    {
        if(error)
        {
            foxylogInfo("Error happen! " + error);
            return;
        }
    });
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
    bot.user.setGame(args);
    /*, function(err)
    {
        if(err)
        {
            var msg = "Error of setting game: " + err;
            foxylogInfo(msg);
            bot.sendMessage(chan, msg, msgSendError);
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
    message.channel.sendMessage(vars[getRandomInt(0, vars.length-1)].trim()).catch(msgSendError);
}

var myrand = function(bot, message, args)
{
    message.channel.sendMessage(getRandomInt(0, 100)).catch(msgSendError);
}

var myrandF = function(bot, message, args)
{
    message.channel.sendMessage(Math.random()).catch(msgSendError);
}

var lunaDocs = function(bot, message, args)
{
    message.channel.sendMessage("http://wohlsoft.ru/pgewiki/" + encodeURIComponent(args)).catch(msgSendError);
}

var lunaSearch = function(bot, message, args)
{
    message.channel.sendMessage("http://wohlsoft.ru/wiki/index.php?search=" + encodeURIComponent(args)).catch(msgSendError);
}

var findInGoogle = function(bot, message, args)
{
    message.channel.sendMessage("http://lmgtfy.com/?q=" + encodeURIComponent(args)).catch(msgSendError);
}

var findInWikipedia = function(bot, message, args)
{
    message.channel.sendMessage("http://wikipedia.lmgtfy.com/?q=" + encodeURIComponent(args)).catch(msgSendError);
}

var youtube = function(bot, message, args)
{
    var videoList = fs.readFileSync(__dirname+"/video_list.txt");
    var videoArr = videoList.toString().trim().split(/[\n\ ]/g);
    var oneVideo = videoArr[getRandomInt(0, videoArr.length-1)];
    message.channel.sendMessage(oneVideo).catch(msgSendError);
}

var meow = function(bot, message, args)
{
    var videoList = fs.readFileSync(__dirname+"/meow_list.txt");
    var videoArr = videoList.toString().trim().split(/[\n\ ]/g);
    var oneVideo = videoArr[getRandomInt(0, videoArr.length-1)];
    message.channel.sendMessage(oneVideo).catch(msgSendError);
}

var woof = function(bot, message, args)
{
    var videoList = fs.readFileSync(__dirname+"/woof_list.txt");
    var videoArr = videoList.toString().trim().split(/[\n\ ]/g);
    var oneVideo = videoArr[getRandomInt(0, videoArr.length-1)];
    message.channel.sendMessage(oneVideo).catch(msgSendError);
}

var butts = function(bot, message, args)
{
    message.delete();
    message.channel.sendMessage("`(__|__)`").catch(msgSendError);
}

var dance = function(bot, message, args)
{
    message.channel.sendFile(__dirname+"/images/dance.gif").catch(msgSendError);
}

var drill = function(bot, message, args)
{
    message.channel.sendFile(__dirname+"/images/drill.gif").catch(msgSendError);
}

var imgSOS = function(bot, message, args)
{
    message.channel.sendFile(__dirname+"/images/SOS.gif").catch(msgSendError);
}


var callBastion = function(bot, message, args)
{
    message.channel.sendMessage("Hey, bastion, tell something!").catch(msgSendError);
}

var callBotane = function(bot, message, args)
{
    var chan = bot.channels.get("216229325484064768");

    //Check is botane offline
    var Botane = bot.users.get("216688100032643072");
    if(Botane.presence.status == "offline")
    {
        message.reply("Botane is dead! Let's play with another bot :smirk:").catch(msgSendError);
        return;
    }

    if(!inListFile("boop_zone.txt", message.channel.id))//"beep-boop"
    {
        message.channel.sendMessage("Go to <#216229325484064768> to enjoy the show :wink: ").catch(msgSendError);
    }
    chan.sendMessage("What is Horikawa?").catch(msgSendError);
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

    message.channel.sendMessage("Starting trolling by "+message.author.username +
                                 "... (every second 5 times will be printed same message)",
                                 opts).catch(msgSendError);

    trollTimerIsBusy[message.author.id]=true;
    var i = 5;
    setTimeout(function run()
    {
        message.channel.sendMessage(args).catch(msgSendError);
        i--;
        if(i>0)
            setTimeout(run, 1000);
    },  1000);

    setTimeout(function unbusy(){ trollTimerIsBusy[message.author.id]=false; }, 120000);
}

var testUrl = function(bot, message, args)
{
    message.channel.sendMessage("http://wohlsoft.ru").catch(msgSendError);
}

var lab = function(bot, message, args)
{
    message.channel.sendMessage("http://wohlsoft.ru/docs/_laboratory/").catch(msgSendError);
}

var repo = function(bot, message, args)
{
    message.channel.sendMessage("https://github.com/WohlSoft/PGE-Project").catch(msgSendError);
}

var markup = function(bot, message, args)
{
    message.channel.sendMessage("https://support.discordapp.com/hc/en-us/articles/210298617").catch(msgSendError);
}


var myTime = function(bot, message, args)
{
    message.channel.sendMessage(getLocalTime()).catch(msgSendError);
}

var upTimeBot = function(bot, message, args)
{
    message.channel.sendMessage(getBotUptime()).catch(msgSendError);
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
    msgtext += "Totally I know **" + Cmds.length + "** commands.\n"
    msgtext += "Unique are **" + CmdsREAL.length + "** commands.\n"
    msgtext += "\n";
    message.channel.sendMessage(msgtext).catch(msgSendError);
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

    // create reusable transporter object using the default SMTP transport
    var transporter = nodemailer.createTransport(smtpMailLoginInfo);

    // setup e-mail data with unicode symbols
    var mailOptions =
    {
        from: smtpMailFrom, // sender address
        //to: 'bar@blurdybloop.com, baz@blurdybloop.com', // list of receivers
        to: smtpMailTo, // list of receivers
        subject: 'Message from ' + (message.author.bot ? "bot" : "user")
                  + " " + (message.member.nickname == null ? message.author.username : message.member.nickname)
                  + ' (@' + message.author.username + "#" + message.author.discriminator + ")"
                  +  ' in the channel #' + message.channel.name + '@' + message.guild.name, // Subject line
        text: args, //plaintext body
        //html: '<b>Hello world!</b>' // html body
        attachments: extraFiles
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info)
    {
        if(doReply)
        {
            if(error)
            {
                message.channel.sendMessage('Failed to send mail: ' + error).catch(msgSendError);
                return;
            }
            message.channel.sendMessage('Message sent: ' + info.response).catch(msgSendError);
        }
    });
}

var sendEmail = function(bot, message, args)
{
    //if(inList(emailBlackList, message.author.id))
    if(inListFile("black_email.txt", message.author.id))
    {
        message.channel.sendMessage("Sorry, " + message.author.toString() + ", emailing is forbidden for you! (you are in black list!) :cop:");
        return;
    }

    if( (emailWhiteList.length>0) && !inList(emailWhiteList, message.author.id))
    {
        message.channel.sendMessage("Sorry, " + message.author.toString() + ", emailing is forbidden for you! (you are not in white list!) :cop:");
        return;
    }

    sendEmailF(message, args, true);
}

var listCmds = function(bot, message, args)
{
    var commands = "**Available commands:**\n";
    for(var i=0; i<Cmds.length; i++)
    {
        if(i>0)
            commands += ", ";
        commands += Cmds[i][0];
    }
    commands += "\n\nTotally I know **" + Cmds.length + "** commands."
    commands += "\nUnique are **" + CmdsREAL.length + "** commands."
    commands += "\n";
    var usefulCount = 0;
    var usefulCommands = "";
    for( k in CmdsREAL)
    {
        if(typeof(CmdsREAL[k][4])!=='undefined')
        {
            if(usefulCount>0)
                usefulCommands += ", ";
            usefulCount++;
            usefulCommands += CmdsREAL[k][0];
        }
    }
    commands += "\nUseful of them are **" + usefulCount + "** commands:\n"
    commands += usefulCommands;

    commands += "\n\nType __**/foxy help <command>**__ to read detail help for specific command."
    message.channel.sendMessage(commands).catch(msgSendError);
}

var cmdHelp = function(bot, message, args)
{
    if(args.trim()=="")
    {
        message.reply("Sorry, I can't describe you empty space! Please specify command you wanna learn!").catch(msgSendError);
        return;
    }
    for(var i=0; i<Cmds.length; i++)
    {
        if(Cmds[i][0]==args)
        {
            var helpCmd = "\n**" + Cmds[i][0] + "**\n" + Cmds[i][2] + "\n";
            if(typeof(Cmds[i][3])!=='undefined')
            {
                helpCmd += "\n**Aliases**: "
                for(var j=0; j<Cmds[i][3].length; j++)
                {
                    if(j>0) helpCmd += ", ";
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

function addSynonimOf(oldcmd, name, customHelp)
{
    if(typeof(customHelp)==='undefined')
        customHelp = "";

    for(var i=0; i<CmdsREAL.length; i++)
    {
        if(CmdsREAL[i][0]==oldcmd)
        {
            var newI = Cmds.length;
            Cmds[newI] = CmdsREAL[i].slice();
            Cmds[newI][0] = name;
            if(customHelp!="")
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

    addCMD(["fox",      fox,              "Are you fan of the foxes :fox:? Just type \"/foxy fox\"!"]);
    addSynonimOf("fox", "foxy");
    addSynonimOf("fox", "🦊");
    addCMD(["boxy",     boxy,             "I wish put something into it..."]);
    addSynonimOf("boxy", "box");
    addSynonimOf("boxy", "🗃");
    addCMD(["burn",     burn,             "BURN!!!"]);
    addCMD(["burns",    burns,            "BURN!!!"]);
    addSynonimOf("burn", "🔥",             "IT'S HOT!!!");
    addSynonimOf("burn", "fire",          "IT'S HOT!!!");
    addCMD(["smile",    smile,            "Take a random smile of the PGE Forums"]);
    addCMD(["boat",     boat,             "Wanna boat? I'll build it for you!"]);
    addCMD(["flower",   flower,           "Do you like flowers? I'll give them for you and friends :sunflower:!"]);
    addCMD(["ship",     ship,             "Seems you really with be a pirate, let's go, captain!"]);
    addCMD(["makeme",   makeMe,           "What are you wish make? Ship? Boat? Box? Fire?\n\n"+
                                          "__*Syntax:*__:\n\n"+
                                          " **/foxy make <any phraze contains any key word(s)>**\n\n" +
                                          "__*Full list things I can do (available key words):*__\n"+
                                          "ship, boat, fire, fox, box, flower, money, coin, cash, lego, elephant, police, cop, butt, ass, fart, gas, smoke, stink, smell, crap, dung, shit, poop."]);
    addSynonimOf("makeme", "make");
    addSynonimOf("makeme", "create");
    addSynonimOf("makeme", "build");
    addSynonimOf("makeme", "produce");
    addSynonimOf("makeme", "give");

    addCMD(["say",      say,              "I'll say some instead you! (attachments also supported!)\n__*Syntax:*__ say <any your text>"]);
    addCMD(["saytts",   sayTTS,           "I'll help to pronuncate you some!\n__*Syntax:*__ saytts <any your text>"]);
    addCMD(["whosaid",  sayLog,           ":spy: Shsh! I'll leak you secret - who asked me to say (5 last messages)\n"]);
    addCMD(["setgame",  setPlayingGame,   "I'll play any game you suggesting me!\n__*Syntax:*__ setgame <any your text>\n\n**NOTE:** Only permited users can use this command!"]);
    addCMD(["remind",   sayDelayd,        ":information_desk_person: I'll remeber a thing you request me!\n__*Syntax:*__ remind <any your text> after <time> <seconds, minutes, hours>\n", [], true]);
    addCMD(["remindme", sayDelaydME,      ":information_desk_person: I'll remeber you personally a thing you request me!\n__*Syntax:*__ remindMe <any your text> after <time> <seconds, minutes, hours>\n", [], true]);
    addCMD(["voting",   voting,           "Wanna choice some? Let's vote!\n"+
                                          "__*Syntax:*__:\n\n"+
                                          " **/foxy voting start __Bonana; Sausidge; Apple; Chicken; Fried mice__**\n" +
                                          "__Start a voting with a list of variants (there are must be splited with semicolons!)__\n\n" +
                                          " **/foxy vote __<variant ID>__**\n__Do Vote for any variant you are prefer (from 1 to N)__\n\n" +
                                          " **/foxy voting stats**\n__Print a result without aborting of the voting__\n\n" +
                                          " **/foxy voting stop**\n **/foxy voting end**\n__Stop voting and print a result__\n", [], true]);
    addCMD(["tr",       translate,        "Хочешь говорить на другом языке?\n"+
                                          "I'll translate your phrase into any language you want\n\n"+
                                          "__*Syntax:*__:\n\n"+
                                          " **/foxy tr [de] __Please, help me find my street!__**\n" +
                                          "__Translate phrase to any language you want. In this example translate phrase into German__\n\n" +
                                          " **/foxy tr __Я говорю по-немецки!__**\n" +
                                          "__Automatically detect language of channel and translate to that language__\n\n" +
                                          "Language of source phrase will be detected automatically.", [], true]);

    addSynonimOf("voting", "vote");
    addSynonimOf("voting", "votes");
    addSynonimOf("voting", "votings");

    addCMD(["spit",     spit,             "I'll spit anything you request!\n__*Syntax:*__ spit <any your text>"]);
    addCMD(["foxface",  foxFace,          "Wanna my face?"]);
    addCMD(["dance",    dance,            "Let's dance!!!"]);
    addCMD(["drill",    drill,            "Wanna drill hole?"]);
    addCMD(["sos",      imgSOS,           "HELP ME!!!"]);

    addCMD(["fart",     fart,             "Ow.... :poop:"]);
    addSynonimOf("fart", "farts");
    addCMD(["butt",     butts,            "You are pervent!"]);
    addSynonimOf("butt", "butts");

    addCMD(["youtube",  youtube,          "Take random youtube video which I know"]);
    addCMD(["meow",     meow,             ":cat:"]);
    addCMD(["woof",     woof,             ":dog:"]);

    addCMD(["trollbasty", callBastion,    "I'll troll some dumb bot which can speak only idiotic sounds, for you!"]);
    addCMD(["trollbotane", callBotane,    "That bot is very trolling, I'll troll it until it will get offline!\n\n**NOTE:** Working only in the #beep-boop room!"]);
    addCMD(["trolltimer", trollTimer,     "Don't use this command until you inside beep-boop zone!"]);

    addCMD(["testurl",  testUrl,          "Test of URL returning. Just return a WohlSoft site url!"]);
    addCMD(["lab",      lab,              "Returns PGE Laboratory URL"]);
    addCMD(["repo",     repo,             "Returns URL to PGE repository on GitHub"]);
    addCMD(["markup",   markup,           "Returns URL for a Discord markdown guide"]);

    addCMD(["err",      wrongfunction,    "It hurts me..."]);

    addCMD(["mytime",   myTime,           "Let's check our watches? :clock: :watch: :stopwatch: :clock1: "]);
    addCMD(["stats",    aboutBot,         "Just my health state"]);
    addSynonimOf("stats", "about",        "Wanna meet me?");
    addCMD(["uptime",   upTimeBot,        "How long I still be here"]);

    addCMD(["help",     cmdHelp,          "Prints help of command"]);

    addCMD(["mailwohlstand", sendEmail,   "Send email to my creator while he is offline. (Attachments are supported!) \n" +
                                          "__*Syntax:*__ mailwohlstand <any your text>", [], true]);

    foxylogInfo( Cmds.length + " command has been registered!");
}

var callCommand = function(bot, message, command, args)
{
    if(inListFile("black_global.txt", message.author.id))
    {
        return;
    }

    var found=false;
    for(var i=0; i<Cmds.length; i++)
    {
        if(Cmds[i][0]==command)
        {
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

function loginBot(bot, token)
{
    authToken = token;
    bot.login(authToken);
    BotPtr = bot;
}

module.exports =
{
    callCommand:      callCommand,
    registerCommands: registerCommands,
    loginBot:         loginBot,
    inListFile:       inListFile,
    sendEmail:        sendEmailF,
    initRemindWatcher:initRemindWatcher,
    msgSendError:     msgSendError,
    sendErrorMsg:     sendErrorMsg,
    botConfig:        botConfig,
    foxylogInfo:      foxylogInfo
};
