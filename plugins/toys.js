/*
    Misc. commands
*/

const fs          = require('fs');

// Main module of FoxyBot
let core = undefined;

function choose(bot, message, args)
{
    let vars = args.split(/,|[ \n]or[ \n]/g);
    if((vars.length === 1) && (vars[0].trim() === ""))
    {
        message.reply("you sent me nothing! I can't choose! :confused:").catch(core.msgSendError);
        return;
    }
    message.channel.send(vars[core.getRandomInt(0, vars.length-1)].trim()).catch(core.msgSendError);
}

function myRand(bot, message, args)
{
    message.channel.send(core.getRandomInt(0, 100)).catch(core.msgSendError);
}

function myRandF(bot, message, args)
{
    message.channel.send(Math.random()).catch(core.msgSendError);
}

function youtube(bot, message, args)
{
    let videoList = fs.readFileSync(__dirname + "/lists/video_list.txt");
    let videoArr = videoList.toString().trim().split(/[\n ]/g);
    let oneVideo = videoArr[core.getRandomInt(0, videoArr.length - 1)];
    message.channel.send(oneVideo).catch(core.msgSendError);
}

function meow(bot, message, args)
{
    /*jslint unparam: true */
    let videoList = fs.readFileSync(__dirname + "/lists/meow_list.txt");
    let videoArr = videoList.toString().trim().split(/[\n ]/g);
    let oneVideo = videoArr[core.getRandomInt(0, videoArr.length - 1)];
    message.channel.send(oneVideo).catch(core.msgSendError);
}

function woof(bot, message, args)
{
    let videoList = fs.readFileSync(__dirname + "/lists/woof_list.txt");
    let videoArr = videoList.toString().trim().split(/[\n ]/g);
    let oneVideo = videoArr[core.getRandomInt(0, videoArr.length - 1)];
    message.channel.send(oneVideo).catch(core.msgSendError);
}


function callBastion(bot, message, args)
{
    message.channel.send("Hey, bastion, tell something!").catch(core.msgSendError);
}


function callBotane(bot, message, args)
{
    let chan = core.getDefaultChannelForGuild(bot, message);
    if(chan.id === message.channel.id)
    {
        message.reply("Don't play with Botane on this server!").catch(core.msgSendError);
        return;
    }

    //Check is botane offline
    let botane = bot.users.get("216688100032643072");
    if(botane.presence.status === "offline")
    {
        message.reply("Botane is dead! Let's play with another bot :smirk:").catch(core.msgSendError);
        return;
    }

    if(!core.inListFile("boop_zone.txt", message.channel.id))//"beep-boop"
    {
        message.channel.send("Go to <#" + channel.id +"> to enjoy the show :wink: ").catch(core.msgSendError);
    }
    chan.send("What is Horikawa?").catch(core.msgSendError);
}

let trollTimerIsBusy = [];
function trollTimer(bot, message, args)
{
    if(!core.inListFile("boop_zone.txt", message.channel.id) && (!message.channel.isPrivate))
    {
        message.reply("Please do this in another channel.").catch(core.msgSendError);
        return;
    }

    if(trollTimerIsBusy[message.author.id])
    {
        message.reply("I'm busy!!! trolltimer possible use onence every 2 minutes!").catch(core.msgSendError);
        return;
    }

    if(core.inListFile("black_trolltimer.txt", message.author.id))
    {
        message.reply("I dont want!").catch(core.msgSendError);
        return;
    }

    if(args.indexOf("@everyone") !== -1 || args.indexOf("@here") !== -1)
    {
        message.reply("Hey, troll everyone yourself! :angry:").catch(core.msgSendError);
        return;
    }

    for(let i = 0; i < message.mentions.length; i++)
    {
        args = args.replace("<@"+message.mentions[i].id+">", "@"+message.mentions[i].username);
    }

    //args = args.replace(/\<\@\d\>/g, "@"+message.mentions[i].username);
    message.mentions = [];

    let opts = {
        disableEveryone: true
    };

    message.channel.send("Starting trolling by "+message.author.username +
        "... (every second 5 times will be printed same message)", opts).catch(core.msgSendError);

    trollTimerIsBusy[message.author.id] = true;
    let i = 5;
    setTimeout(function run()
    {
        message.channel.send(args).catch(core.msgSendError);
        i--;
        if(i > 0)
            setTimeout(run, 1000);
    },  1000);

    setTimeout(function unBusy(){ trollTimerIsBusy[message.author.id]=false; }, 120000);
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
    core.addCMD(["choose",   choose,           "Randomly chooses one of words from list.\n__*Syntax:*__ choose <word1>, <word2> or <word3>\n\nAllowed separators: \",\", \"or\".", [], true]);
    core.addCMD(["rand",     myRand,           "Random integer from 0 to 100"]);
    core.addCMD(["randf",    myRandF,          "Random floating pointer number from 0.0 to 1.0"]);

    core.addCMD(["youtube",  youtube,          "Take random youtube video which I know"]);
    core.addCMD(["meow",     meow,             ":cat:"]);
    core.addCMD(["woof",     woof,             ":dog:"]);

    core.addCMD(["trollbasty", callBastion,    "I'll troll some dumb bot which can speak only idiotic sounds, for you!"]);
    core.addCMD(["trollbotane", callBotane,    "That bot is very trolling, I'll troll it until it will get offline!\n\n**NOTE:** Working only in the #beep-boop room!"]);
    core.addCMD(["trolltimer", trollTimer,     "Don't use this command until you inside beep-boop zone!"]);
}

module.exports =
{
    // Initialize plugin and here you can add custom Foxy's commands
    registerCommands:   registerCommands
};

