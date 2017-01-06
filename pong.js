/*

FoxyBoyJr Discord bot by Wohlstand

REQUIRED:
+ https://github.com/hydrabolt/discord.js
+ http://nodemailer.com/
+ npm install yandex.translate


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

var Discord = require("discord.js");
var botCommands = require("./bot_commands");

var mybot = new Discord.Client();
mybot.autoReconnect = true;

console.log("==========================================================");
console.log("           FoxyBotJr by Wohlstand          ");
console.log("==========================================================");

botCommands.registerCommands();

function statusError(error)
{
    if(error)
    {
        console.log('There was an error seting status: ' + error);
    }
}

function nickError(error)
{
    if(error)
    {
        console.log('There was an error seting nick: ' + error);
    }
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

process.on('SIGINT', function()
{
    console.log("\n\nCaught interrupt signal\n");
    mybot.user.setStatus("idle");
    mybot.user.setGame("Interrupted");
    //mybot.setPlayingGame("Interrupted", statusError);
    console.log("Sent \"Away\" status!");
    sleep(1000);
    process.exit();
});

process.on('SIGHUP', function()
{
    console.log("\n\nCaught SIGHUP signal\n");
    mybot.user.setStatus("dnd");
    mybot.user.setGame("Screen killed");
    //mybot.setStatusIdle();
    //mybot.setPlayingGame("Screen killed", statusError);
    console.log("Sent \"Away\" status!");
    sleep(1000);
    process.exit();
});

mybot.on("ready", () =>
    {
        console.log('set status...');
        //mybot.setStatusOnline();
        mybot.user.setStatus("online");
        mybot.user.setGame("Working");
        //console.log('set nick...');
        //mybot.setNickname(mybot.servers[0], "FoxyBot", mybot.user, nickError);
        console.log('DONE!\n==========================================================\n\n');
    }
);

mybot.on('reconnecting', () => {
        console.log('Connection lost, trying to reconnect...');
});

mybot.on("presenceUpdate", (oldUser, newUser) =>
{
    if(newUser.nickname == null)
        return;

    var nickOfBot = newUser.nickname;
    var newStatus = newUser.presence.status;
    var chan = mybot.channels.get("216229325484064768");//boopZone
    //console.log('=> User ' + newUser.nickname + ' was changed to ' + newStatus + '\n');

    switch(newUser.id)
    {
    /*
    case "182039820879659008":
        if(newStatus == "online")
        {
            chan.sendMessage("WOOO-HOO!!! :metal::skin-tone-1:");
        }
    break;
    */
    case "247080657182785546"://Yoshi's Egg
        if(newStatus == "online")
        {
            setTimeout(function()
            {
                chan.sendMessage("Ah ow.. :open_mouth: Fried Egg is here!..." +
                    ( (nickOfBot != "Yoshi Egg") ?
                    "\nIt is masquarated as \"" + nickOfBot + "\", be careful!" : "")
                );
            }, 3000);
        }
    break;
    case "216688100032643072"://When Botane died
        if(newStatus == "offline")
        {
            //Send to #beeo-boop "WOO-HOO!!" since Botane is dead
            chan.sendMessage("Botane is dead, WOOO-HOO!!! :metal::skin-tone-1:");
        }
    break;
    case "216273975939039235": //LunaBot died
        if(newStatus == "offline")
        {
            chan.sendMessage("<@214408564515667968>, LunaBot is dead...\nWHY???? :hushed:\n She was a VERY good bot! :sob:");
        }
    break;
    case "216243239391330305"://Bastion died
        if(newStatus == "offline")
        {
            chan.sendMessage("Bastion is dead?! :hushed: What happen with it?");
        }
    break;
    }
});


String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

function hasReg(msg, word)
{
    return msg.regexIndexOf(word) != -1;
}

function hasStr(msg, word)
{
    return msg.indexOf(word) != -1;
}

mybot.on("message", function(message)
{
    //Ignore messages sent by myself
    if( message.author.id == 216943869424566273 )
        return;

    var allowWrite = !botCommands.inListFile("readonly_chans.txt", message.channel.id);

    var msgTrimmed = message.content.trim();
    var msgLow = message.content.toLowerCase();
    var msgLowTrimmed = msgLow.trim();

    console.log("***" + message.author.username + ": " + message.content );

    /* *********Standard command processor********* */
    if((msgLowTrimmed == "/foxy") && (allowWrite))
    {
        try
        {
            if(botCommands.inListFile("black_global.txt", message.author.id))
            {
                return;
            }
            message.channel.sendMessage("Hello, I'm **FoxyBot**!\n" +
                                        "   Type **/foxy cmd** to learn my commands\n" +
                                        "   Type __**/foxy help <command>**__ to read detail help for specific command.",
                                        botCommands.msgSendError);
        }
        catch(e)
        {
            botCommands.sendErrorMsg(mybot, message.channel, e);
        }
    }
    else
    if(allowWrite && msgLowTrimmed.startsWith("/foxy "))
    {
        var botCmd = msgTrimmed.slice(6).trim();
        console.log("Cmd received: "+botCmd);

        var firstSpace = botCmd.indexOf(' ');
        if(firstSpace==-1)
            firstSpace = botCmd.indexOf('\n');
        var botCommand = "";
        var botArgs = "";
        if(firstSpace != -1)
        {
            botCommand = botCmd.slice(0, firstSpace).trim();
            botArgs = botCmd.slice(firstSpace+1).trim();
            console.log("->>Cmd: "+botCommand);
            console.log("->>Arg: "+botArgs);
        }
        else
            botCommand = botCmd.trim();

        botCommands.callCommand(mybot, message, botCommand.toLowerCase(), botArgs);
    }
    else
    if((msgLowTrimmed == "!talk") && (allowWrite))
    {
        try
        {
            var Egg = mybot.users.get("247080657182785546");
            if(Egg.presence.status == "offline")
            {
                message.reply("Sorry, egg is offline... :cooking:", botCommands.msgSendError);
            }
        }
        catch(e)
        {
            botCommands.sendErrorMsg(mybot, message.channel, e);
        }
    }

    /* *********Auto-replying for some conditions********* */
    else
    {
        var wasAsked = false;
        var messageForMe = false;
        var mentions = message.mentions.users.array();

        for(var i=0; i<mentions.length; i++)
        {
            console.log( "--->" + mentions[i].username );
            wasAsked = mentions[i].id == 216943869424566273;
            messageForMe = (mentions[i].id == 182039820879659008) && (message.author.id != 216943869424566273);
        }

        if(msgLowTrimmed.indexOf("pge") != -1)
            messageForMe = true;
        if(msgLowTrimmed.indexOf("wohlstand") != -1)
            messageForMe = true;
        if(msgLowTrimmed.indexOf("wholstand") != -1)
            messageForMe = true;
        if(msgLowTrimmed.indexOf("wohl") != -1)
            messageForMe = true;

        if(message.author.id == 182039820879659008)//Don't quote me, Foxy!!!
            messageForMe = false;

        //Check is botane offline, and reply on attempt call her
        var Botane = mybot.users.get("216688100032643072");
        if(allowWrite && (Botane.presence.status == "offline"))
        {
            if(msgLowTrimmed == "what is horikawa?")
            {
                message.reply("Don't try call her, she is dead bot!");
            }
        }

        if(allowWrite && (wasAsked || message.channel.isPrivate))
        {
            if(message.author.id == 216688100032643072)//Horikawa Botane
            {
                if(msgLow.indexOf("dorkatron")!=-1)
                {
                    message.reply("maybe you are a Dorkatron? I'm not!");
                }
            }
            else//Any other
            {
                if(msgLow.indexOf("pets") != -1)
                {
                    setTimeout(function(){ message.reply("Do you really wanna pet the fox? :fox:"); }, 1000);
                    setTimeout(function() { botCommands.callCommand(mybot, message, "fox", ""); }, 3500);
                }
                else
                if(msgLow.indexOf("hi!") != -1)
                {
                    setTimeout(function(){ message.channel.sendFile(__dirname+"/images/hi.gif"); }, 1000);
                }
                else
                if(msgLow.indexOf("hi") != -1)
                {
                    setTimeout(function(){ message.reply("Hi!"); }, 1000);
                }
                else
                if(msgLow.indexOf("i like you") != -1)
                {
                    setTimeout(function(){ message.reply(":blush:"); }, 1000);
                }
                else
                if(msgLow.indexOf("i love you") != -1)
                {
                    setTimeout(function(){ message.reply(":blush:"); }, 1000);
                }
                else
                if(msgLow.indexOf("♥") != -1)
                {
                    setTimeout(function(){ message.reply(":blush:"); }, 1000);
                }
                else
                if(msgLow.indexOf("❤") != -1)
                {
                    setTimeout(function(){ message.reply(":blush:"); }, 1000);
                }//♥ ❤ ღ ❦ ❥❣
                else
                if(msgLow.indexOf("🍺") != -1)
                {
                    setTimeout(function(){ message.reply(":beers:"); }, 1000);
                }
                else
                if(msgLow.indexOf("🍻") != -1)
                {
                    setTimeout(function(){ message.reply(":beers: :beer:"); }, 1000);
                }
                else
                if(hasReg(msgLow, /((f[auo]([ck][ck]|[ck])|[cs][ck]rew)( ||\n)+(you|[yu]|yo|yu|yoo))/ig))
                {
                    setTimeout(function(){ message.reply("You so rude! :angry:"); }, 1000);
                }
                else
                if(msgLow.indexOf("🤘") != -1)
                {
                    setTimeout(function(){ message.reply("Сool, dude!"); }, 1000);
                }
            }
        }
        else
        {
            if(messageForMe)
            {
                botCommands.sendEmail(message, message.content, false);
            }

            if(allowWrite)
            {
                if(message.channel.id == 216229325484064768)//"beep-boop", "fun" 218194030662647809
                {
                    if(message.author.id==216688100032643072)//Horikawa Botane
                    {
                        if(msgLowTrimmed.indexOf("is it porn?") != -1)
                        {
                            setTimeout(function(){message.channel.sendMessage("No, <@216688100032643072>!").catch(botCommands.msgSendError);}, 1000);
                        }
                        else
                        if(msgLowTrimmed.indexOf("i don't believe you") != -1)
                        {
                            setTimeout(function(){message.channel.sendMessage("Let's play with Bastion!").catch(botCommands.msgSendError);}, 1000);
                            setTimeout(function(){message.channel.sendMessage("Bastion Bastion Bastion Bastion!!!!").catch(botCommands.msgSendError);}, 2000);
                            setTimeout(function(){message.channel.sendMessage("bastion bastion bastion bastion bastion").catch(botCommands.msgSendError);}, 3500);
                        }
                    }
                }
            }
        }
    }

});

botCommands.loginBot(mybot, botCommands.botConfig.token);
