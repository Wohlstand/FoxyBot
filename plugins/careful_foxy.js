/*
    Careful foxy watches all incoming messages:
        catches mentions, or can play with other bots or users
*/

var botCommands = undefined;

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

var eggCommands = ["!color", "!commander", "!egg", "!hatch", "!ping", "!prefix", "!quote", "!role", "!spam", "!tag", "!talk", "!cmd", "!help"];

// Check out is Yoshi021's Egg bot online, if not - notify user
// that Egg is "eaten" :-P
function lookUpForEgg(mybot, message, msgLowTrimmed, allowWrite)
{
    if(!allowWrite)
        return false;

    if(eggCommands.indexOf(msgLowTrimmed) != -1)
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
        return true;
    }
    return false;
}

var messageIn = function(mybot, message, allowWrite)
{
    var msgTrimmed      = message.content.trim();
    var msgLow          = message.content.toLowerCase();
    var msgLowTrimmed   = msgLow.trim();

    if(!lookUpForEgg(mybot, message, msgLowTrimmed, allowWrite))
    /* *********Auto-replying for some conditions********* */
    {
        var wasAsked = false;
        var messageForMe = false;
        var mentions = message.mentions.users.array();

        for(var i = 0; i < mentions.length; i++)
        {
            botCommands.foxylogInfo( "---> " + mentions[i].username + "#" + mentions[i].discriminator);
            wasAsked = (mentions[i].id == 216943869424566273);
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

        if(hasReg(msgLowTrimmed, /don('|"|)t.*(@|ping|call).*(me|you|my)/ig))
        {
            if(hasReg(msgLowTrimmed, /fuck|shit|idiot|jerk/ig))
                message.reply("Don't swear, and disable your notifications instead! :hear_no_evil:");
            else if(hasReg(msgLowTrimmed, /evil/ig))
                message.reply("I'm not evil, I just asking you disable your notificaations! :hear_no_evil:");
            else if(hasReg(msgLowTrimmed, /cute/ig))
                message.reply("O, thanks, but please disable your notifications to don't listen so annoying pings :hear_no_evil:");
            else
                message.reply("disable notifications please! :hear_no_evil:");
        }

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
                if(botCommands.botConfig.defaultChannel.includes(message.channel.id))//"beep-boop", "fun" 218194030662647809
                {
                    if(message.author.id == 216688100032643072)//Horikawa Botane
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
}

function registerCommands(foxyCore)
{
    botCommands = foxyCore;
}

module.exports =
{
    registerCommands:   registerCommands,
    messageIn:          messageIn
};