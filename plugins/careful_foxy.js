/*
    Careful foxy watches all incoming messages:
        catches mentions, or can play with other bots or users
*/

let botCommands = undefined;

String.prototype.regexIndexOf = function(regex, startpos) {
    let indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};

function hasReg(msg, word)
{
    return msg.regexIndexOf(word) !== -1;
}

function hasStr(msg, word)
{
    return msg.indexOf(word) !== -1;
}

/*
var eggCommands = [
    "!color",
    "!commander",
    "!egg",
    "!hatch",
    "!ping",
    "!prefix",
    "!quote",
    "!role",
    "!spam",
    "!tag",
    "!talk",
    "!cmd",
    "!help",
    "!rps"
];


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
*/

let keyPrefix = [
    "wohl",
    "whol",
    "wolh",
    "wohlstand",
    "wholstand",
    "wolhstand"
];

function lookUpForKeyPrefix(msgLowTrimmed)
{
    var forMe = false;

    for(var i = 0; i < keyPrefix.length; i++)
    {
        if((msgLowTrimmed.indexOf(keyPrefix[i] + ":") === 0) ||
           (msgLowTrimmed.indexOf(keyPrefix[i] + ",") === 0))
            forMe = true;
    }

    return forMe;
}

let keyMentions = [
    "pge",
    "wohl",
    "whol",
    "wolh",
    "wohlstand",
    "wholstand",
    "wolhstand",
    "moondust",
    "adlmidi",
    "opnmidi",
    "sdl",
    "midi"
];

function lookUpForKeyMentions(msgLowTrimmed)
{
    let forMe = false;

    for(let i = 0; i < keyMentions.length; i++)
    {
        if(msgLowTrimmed.indexOf(keyMentions[i]) !== -1)
            forMe = true;
    }

    return forMe;
}

function messageIn(mybot, message, allowWrite)
{
    let msgTrimmed      = message.content.trim();
    let msgLow          = message.content.toLowerCase();
    let msgLowTrimmed   = msgLow.trim();

    let urlMask         = /(https?:\/\/wohlsoft.ru\/?[A-Za-z%0-9().\-_\/&?=]*)/g;

    // Remove any wohlsoft URLs from the text
    msgTrimmed          = msgTrimmed.replace(urlMask, "[url]");
    msgLow              = msgLow.replace(urlMask, "[url]");
    msgLowTrimmed       = msgLowTrimmed.replace(urlMask, "[url]");

    /*
    if(lookUpForEgg(mybot, message, msgLowTrimmed, allowWrite))
        return;
    */

    /* *********Auto-replying for some conditions********* */
    let wasAsked = false;
    let messageForMe = false;
    let messageForMeReact = false;
    let mentions = message.mentions.users.array();

    for(let i = 0; i < mentions.length; i++)
    {
        botCommands.foxyLogInfo( "---> " + mentions[i].username + "#" + mentions[i].discriminator);
        wasAsked = (mentions[i].id === mybot.user.id);
        messageForMe = (mentions[i].id === "182039820879659008") && (message.author.id !== mybot.user.id);
        messageForMeReact = messageForMe;
    }

    if(lookUpForKeyMentions(msgLowTrimmed)) //Shadow email
        messageForMe = true;

    if(lookUpForKeyPrefix(msgLowTrimmed))   //Transparent email
    {
        messageForMe = true;
        messageForMeReact = true;
    }

//        var whoWannaPing = [69055500540456960/*Spinda*/];
//        if( (whoWannaPing.indexOf(message.author.id) != -1)
//            && hasReg(msgLowTrimmed, /don('|"|)t.*(@|ping|call).*(me|you|my)/ig) )
//        {
//            if(hasReg(msgLowTrimmed, /fuck|shit|idiot|jerk/ig))
//                message.reply("Don't swear, and disable your notifications instead! :hear_no_evil:");
//            else if(hasReg(msgLowTrimmed, /evil/ig))
//                message.reply("I'm not evil, I just asking you disable your notificaations! :hear_no_evil:");
//            else if(hasReg(msgLowTrimmed, /cute/ig))
//                message.reply("O, thanks, but please disable your notifications to don't listen so annoying pings :hear_no_evil:");
//            else
//                message.reply("disable notifications please! :hear_no_evil:");
//        }
    if(message.author.id === "182039820879659008")//Don't quote me, Foxy!!!
        messageForMe = false;

    if(botCommands.isurl(msgTrimmed))//Also please, don't report me URLs
        messageForMe = false;

    if((message.author.id === "216273975939039235") && messageForMe)
    {
        messageForMeReact = false; //Don't react to LunaBot
        if((msgLowTrimmed.indexOf("http://wohlsoft.ru/") === 0) && (msgLowTrimmed.indexOf(" ") === -1))
            messageForMe = false; //Don't report LunaBot's URLs
    }

    //Check is botane offline, and reply on attempt call her
    let Botane = mybot.users.get("216688100032643072");
    if(allowWrite && (Botane !== undefined) && (Botane.presence.status === "offline"))
    {
        if(msgLowTrimmed === "what is horikawa?")
        {
            message.reply("Don't try call her, she is dead bot!");
        }
    }

    if(allowWrite && (wasAsked || message.channel.isPrivate))
    {
        if(message.author.id === "216688100032643072")//Horikawa Botane
        {
            if(msgLow.indexOf("dorkatron") !== -1)
            {
                message.reply("maybe you are a Dorkatron? I'm not!");
            }
        }
        else//Any other
        {
            if(msgLow.indexOf("pets") !== -1)
            {
                setTimeout(function(){ message.reply("Do you really wanna pet the fox? :fox:"); }, 1000);
                setTimeout(function() { botCommands.callCommand(mybot, message, "fox", ""); }, 3500);
            }
            else
            if(msgLow.indexOf("hi!") !== -1)
            {
                setTimeout(function(){ message.channel.sendFile(__dirname+"/images/hi.gif"); }, 1000);
            }
            else
            if(msgLow.indexOf("hi") !== -1)
            {
                setTimeout(function(){ message.reply("Hi!"); }, 1000);
            }
            else
            if(msgLow.indexOf("i like you") !== -1)
            {
                setTimeout(function(){ message.reply(":blush:"); }, 1000);
            }
            else
            if(msgLow.indexOf("i love you") !== -1)
            {
                setTimeout(function(){ message.reply(":blush:"); }, 1000);
            }
            else
            if(msgLow.indexOf("♥") !== -1)
            {
                setTimeout(function(){ message.reply(":blush:"); }, 1000);
            }
            else
            if(msgLow.indexOf("❤") !== -1)
            {
                setTimeout(function(){ message.reply(":blush:"); }, 1000);
            }//♥ ❤ ღ ❦ ❥❣
            else
            if(msgLow.indexOf("🍺") !== -1)
            {
                setTimeout(function(){ message.reply(":beers:"); }, 1000);
            }
            else
            if(msgLow.indexOf("🍻") !== -1)
            {
                setTimeout(function(){ message.reply(":beers: :beer:"); }, 1000);
            }
            else
            if(hasReg(msgLow, /((f[auo]([ck][ck]|[ck])|[cs][ck]rew)( ||\n)+(you|[yu]|yo|yu|yoo))/ig))
            {
                setTimeout(function(){ message.reply("You so rude! :angry:"); }, 1000);
            }
            else
            if(msgLow.indexOf("🤘") !== -1)
            {
                setTimeout(function(){ message.reply("Сool, dude!"); }, 1000);
            }
        }
    }
    else
    {
        if(messageForMe)
        {
            console.log("Sending email...");
            botCommands.sendEmail(message, message.content, false);
            if(messageForMeReact)
                message.react("📧");//Mark message as reported
        }

        if(allowWrite)
        {
            if(botCommands.botConfig.defaultChannel.includes(message.channel.id))//"beep-boop", "fun" 218194030662647809
            {
                if(message.author.id === 216688100032643072)//Horikawa Botane
                {
                    if(msgLowTrimmed.indexOf("is it porn?") !== -1)
                    {
                        setTimeout(function(){message.channel.send("No, <@216688100032643072>!").catch(botCommands.msgSendError);}, 1000);
                    }
                    else
                    if(msgLowTrimmed.indexOf("i don't believe you") !== -1)
                    {
                        setTimeout(function(){message.channel.send("Let's play with Bastion!").catch(botCommands.msgSendError);}, 1000);
                        setTimeout(function(){message.channel.send("Bastion Bastion Bastion Bastion!!!!").catch(botCommands.msgSendError);}, 2000);
                        setTimeout(function(){message.channel.send("bastion bastion bastion bastion bastion").catch(botCommands.msgSendError);}, 3500);
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
