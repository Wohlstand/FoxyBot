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

let eggCommands = [
    "$color",
    "$commander",
    "$egg",
    "$hatch",
    "$ping",
    "$prefix",
    "$role",
    "$tag",
    "$hang",
    "$cmd",
    "$help",
    "$rps",
    "$quote", // Dead commands
    "$talk",
    "$spam"
];


// Check out is Yoshi021's Egg bot online, if not - notify user
// that Egg is "eaten" :-P
function lookUpForEgg(myBot, message, msgLowTrimmed, allowWrite)
{
    if(!allowWrite)
        return false;

    if(!message.channel || !message.channel.guild || message.channel.guild.id !== "692079249594515607")
        return false; // Don't check egg bot out of a home server

    for(let i = 0; i < eggCommands.length; ++i)
    {
        if(msgLowTrimmed.startsWith(eggCommands[i]))
        {
            try
            {
                let egg = myBot.users.resolve("247080657182785546");
                if(egg && egg.presence.status === "offline")
                {
                    message.reply("Sorry, egg is offline... :cooking:", botCommands.msgSendError);
                }
            }
            catch (e)
            {
                botCommands.sendErrorMsg(myBot, message.channel, e);
            }
            return true;
        }
    }
    return false;
}

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

// [ \-_+=\\/!@#$%^&*():;'".,?|`~]

const keyMentions = [
    /\b(?:p[ \-_+=\\/!@#$%^&*():;'".,?|`~]*g[ \-_+=\\/!@#$%^&*():;'".,?|`~]*e)\b/gi,
    /\b(?:w[ \-_+=\\/!@#$%^&*():;'".,?|`~]*o[ \-_+=\\/!@#$%^&*():;'".,?|`~]*h[ \-_+=\\/!@#$%^&*():;'".,?|`~]*l)\b/gi,
    /\b(?:w[ \-_+=\\/!@#$%^&*():;'".,?|`~]*h[ \-_+=\\/!@#$%^&*():;'".,?|`~]*o[ \-_+=\\/!@#$%^&*():;'".,?|`~]*l)\b/gi,
    /\b(?:w[ \-_+=\\/!@#$%^&*():;'".,?|`~]*o[ \-_+=\\/!@#$%^&*():;'".,?|`~]*l[ \-_+=\\/!@#$%^&*():;'".,?|`~]*h)\b/gi,
    /w(ohl|hol|olh)e?stand/gi,
    /\b(?:moon[ \-_+=\\/!@#$%^&*():;'".,?|`~]*dust)\b/gi,
    /\b(?:adl[ \-_+=\\/!@#$%^&*():;'".,?|`~]*midi)\b/gi,
    /\b(?:opn[ \-_+=\\/!@#$%^&*():;'".,?|`~]*midi)\b/gi,
    /\b(?:sdl2?)\b/gi,
    /\b(?:sdl2?[ \-_+=\\/!@#$%^&*():;'".,?|`~]*mixer[ \-_+=\\/!@#$%^&*():;'".,?|`~]*?e?x?t?)\b/gi,
    /\b(?:mixer[ \-_+=\\/!@#$%^&*():;'".,?|`~]*x)\b/gi,
    /\b(?:midi)\b/gi
];

function hasMatches(text, reg)
{
    let m = text.match(reg);
    return m && m.length > 0;
}

function lookUpForKeyMentions(msgLowTrimmed)
{
    let forMe = false;

    for(let i = 0; i < keyMentions.length; i++)
    {
        if(hasMatches(msgLowTrimmed, keyMentions[i]))
        {
            botCommands.foxyLogInfo("== Caught a mention of " + keyMentions[i] + "! ==");
            forMe = true;
        }
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

    // if(lookUpForEgg(mybot, message, msgLowTrimmed, allowWrite))
    //     return;

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

    if(message.author.id === "303661490114789391")//Don't disturb me, Yappy Bot
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
    let Botane = mybot.users.resolve("216688100032643072");
    if(allowWrite && Botane && (Botane.presence.status === "offline"))
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
        if(messageForMe && message.guild)
        {
            // Check if Me is on this guild
            message.guild.members.fetch("182039820879659008").then(function (gotMember)
            {
                // Check if Me can see this channel
                if(message.channel.permissionsFor(gotMember).has('VIEW_CHANNEL'))
                {
                    console.log("Sending email...");
                    botCommands.sendEmail(message, message.content, false);
                    if(messageForMeReact)
                    {
                        message.react("📧").then(function (q)
                        {
                            console.log("Reaction was set");
                        });//Mark message as reported
                    }
                }
                else
                {
                    console.log("Got a keyword mention from inaccessible channel");
                }
            }).catch(function(err)
            {
                console.log("Got a keyword mention from inaccessible guild");
            });
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
