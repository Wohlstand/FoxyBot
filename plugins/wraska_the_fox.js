/*
    A buddy for a Roboloe who is a big fan of a boring anime
*/

// Main module of FoxyBot
let core = undefined;

// Initialize plugin and here you can add custom Foxy's commands
function registerCommands(/*bot_commands.js module*/ foxyCore)
{
    core = foxyCore;
}

function getArrayRandom(array)
{
    if  (array == null)
        return {index:null, value:null};
    else
    {
        let id = Math.floor(Math.random() * (array.length));
        let val = array[id];
        return {index:id, value:val}
    }
}

let roboloeSpeech = [
     "/luna senpai",
     "/luna sempai",
     "/luna fart",
     "/luna farts",
     "/luna butt",
     "/luna butts",
     "/luna dank",
     "/luna chan",
     "/luna kun",
     "/luna tan",
     "/luna yotsuba",
     "/luna lewd",
     "/luna frogsuit",
     "/luna kawaii"
];

let sheIsWraska =
[
    "I saw this lot of times... Let's enjoy a cute Wraska instead of this!",
    ".... boring! :expressionless:\nWraska, come here!",
    "Maybe you will stop to post this anime post again? Wraska, please show your beauty to everyone!",
    "Hey, Knux, please ask Wraska to come here while I kicking to Roboloe's ass...\nNo? Okay, You better can kick his ass than me.\nAnyway, Wraska is already here!",
    "Roboloe, do you Wanna a good Anime? Go to Japen!\nOh, hello Wraska :3",
    "Anime from Luna's collection is not better than Hayao Miyazaki's Anime, Wraska can confirm than :3",
    ".... Boring and Annoying!\nI better watch something Hayao Miyazaki's together with Wraska!"
];

let wraskaIsKawaii =
[
    "No one anime girl kawaii more than Wraska Snowy Fox",
    "You are not kawaii, Wraska is kawaii!",
    "No, you are not kawaii!\nWraska is kawaii!",
    "No, you are not kawaii!\nWraska can confirm that :3",
    "Robo, you will never be kawaii!\nWraska is kawaii forever!",
    "I don't think this is kawaii... Let's see true kawaii - Wraska!"
];

let myHealfIsFine = ["I'm not broken. You are broken: you have annoyed us with your dumb anime!",
         "I recently was at my doctor, and he told I'm fine! I suggesting you to do same!",
         "Why I'm sick? So, you are not a doctor to tell me that I'm sick... Can you check your health instead of mine?",
         "I was sick some time ago, but now I'm fine! :3",
         "Broken? You want to say 'sick'? Sorry, but my doctor says I'm fine!"];

let furiesAreBest = ["I want to see more furries than anime!",
                     "Anime is no more actual, Furries are best choice for now!"];

let obnoxiusRobo = ["Mayby you will stop to post anime?",
                     "Robo, you are looking more obnoxious than me with that annoying anime!",
                     "Look to yourself, crazy anime bot!",
                     "Hey, Knux, please kick that anime bot to his metallic ass!"];

let lunaOffline = [
    "Robo, do you know that Luna is asleep! Please don't disturb her, stupid machine!",
    "Shhh! Don't be loud, Luna is asleep!",
    "Don't try to disturb sleeping Luna, or I'll bite you!",
    "Robo, are you blind? Luna is sleeping!",
    "Oh no, Robo, don't try to disturb Luna, she will be so angry...",
    "Hoeloe, please explain to this stupid robot that Luna is sleeping, he don't wanna understand this!!!"
];

let roboloeTalkTable = [
    ["maybe foxy is actually broken", myHealfIsFine],
    ["Why does foxy occasionally post that?", furiesAreBest],
    ["Why does foxy occasionally post this?", furiesAreBest],
    ["i find foxy more obnoxious by a long shot", obnoxiusRobo],
    ["i find foxy way more obnoxious by a long shot", obnoxiusRobo],
    ["basically where it follows the manga it's good fun",
        ["Don't forgot about furries!",
         "Anime - boring, Furries - funny, Anime + Furries = Let's see!",
         "& Foxes!"]
    ],
    ["Foxy just gets creepier",
        ["Really? Then...... Boo! :ghost:",
         "Why such a big robot is afraid a little Foxy? :3",
         "You better fear ghosts and zombies than little fluffy foxies :-P",
         "Do you really think Knux will do kick your ass so strong? Don't worry, he is too lazy to do this :wink:"]
    ],
    ["\" is wasting everyone's time",
        ["Anime posting is also wastes everyone's time!",
         "You are wasting more time by posting anime things from Luna's outdated collection, why not to post something different than Anime?",
         "Everyone, does Wraska wastes your time? Or you are prefer to see a boring outdated Luna's anime collection?"]
    ],
    ["yeah, foxy does or did some stuff",
        [":3"]
    ],
    ["there are a couple of neat wraskas in the uk too",
        ["Many foxes are living in the UK, and especially in London! :3",
         "Are you met some of them? :3",
         "Our Wraska is a Snowy fox who living in St. Peterburg in the flat together with her owners who are raised her",
         "'Wraska' (Russian \"Враска\", reading as \"Vraska\") is a proper name of one fox, did you meant another Snowy foxies?"]
    ]
];

function isLunaHere(mybot, message)
{
    try
    {
        let Luna = mybot.users.get("216273975939039235");
        if(Luna.presence.status === "offline")
            return false;
    }
    catch(e)
    {
        core.sendErrorMsg(mybot, message.channel, e);
        return false;
    }
    return true;
}

var wraskaWas = false;

function messageUpdate(/*Client*/ bot, /*Old Message*/ messageOld, /*New Message*/ messageNew, /*bool*/ channelIsWritable)
{
    messageIn(bot, messageNew, channelIsWritable);
}

// Catch incoming messages: you can make foxy be more talkative or implement a custom command handler from the raw text
function messageIn(/*Client*/ bot, /*Message*/ message, /*bool*/ channelIsWritable)
{
    let msgTrimmed      = message.content.trim();

    if(channelIsWritable && (message.author.id === 320247723641012235)) //It's me: 182039820879659008, when I wanna play Roboloe (320247723641012235)
    {
        if(msgTrimmed === "/luna kawaii")
        {
            if(isLunaHere(bot, message))
            {
                setTimeout(function()
                {
                    message.channel.send(getArrayRandom(wraskaIsKawaii).value).catch(core.msgSendError);
                    wraskaWas = true;
                }, 3000);
                setTimeout(function()
                {
                    if(typeof(core.wraska) != 'undefined')
                        core.wraska(bot, message, "wraska");
                    wraskaWas = true;
                }, 3500);
            } else {
                message.channel.send(getArrayRandom(lunaOffline).value).catch(core.msgSendError);
                wraskaWas = true;
            }
        }
        else
        if(roboloeSpeech.indexOf(msgTrimmed) !== -1)
        {
            if(isLunaHere(bot, message))
            {
                setTimeout(function()
                {
                    message.channel.send(getArrayRandom(sheIsWraska).value).catch(core.msgSendError);
                    wraskaWas = true;
                }, 3000);
                setTimeout(function()
                {
                    if(typeof(core.wraska) != 'undefined')
                        core.wraska(bot, message, "wraska");
                    wraskaWas = true;
                }, 3500);
            } else {
                message.channel.send(getArrayRandom(lunaOffline).value).catch(core.msgSendError);
                wraskaWas = true;
            }
        }
        else
        {
            var messageSent = false;

            if(wraskaWas)
            {
                if(msgTrimmed === "that's firstly not true")
                {
                    setTimeout(function()
                    {
                        message.channel.send("No, that absolutely true! You have annoyed with anime a lot of people!\n"+
                                             "We are furries, and we wanna more foxes!")
                                             .catch(core.msgSendError);
                    }, 3000);

                    setTimeout(function()
                    {
                        if(typeof(core.fox) != 'undefined')
                            core.fox(bot, message, "fox");
                    }, 3800);
                    messageSent = true;
                }

                if(msgTrimmed === "thats a bad thing")
                {
                    setTimeout(function()
                    {
                        message.reply("Your is worse :-P", core.msgSendError);
                    }, 3500);
                    messageSent = true;
                }

                if(msgTrimmed === "im kawaii")
                {
                    setTimeout(function()
                    {
                        message.reply("Really?! Give a proof please :3", core.msgSendError);
                    }, 3500);
                    messageSent = true;
                }

                if(msgTrimmed === "yeah")
                {
                    setTimeout(function()
                    {
                        message.reply(":3", core.msgSendError);
                    }, 3000);
                    messageSent = true;
                }
            }

            if(!messageSent)
            {
                //var debug = "";
                for(let i = 0; i < roboloeTalkTable.length; i++)
                {
                    //debug += "'" + msgTrimmed + "' == '" + roboloeTalkTable[i][0] + "' ";
                    if(msgTrimmed.indexOf(roboloeTalkTable[i][0]) !== -1)
                    {
                        setTimeout(function()
                        {
                            message.channel.send(getArrayRandom(roboloeTalkTable[i][1]).value).catch(core.msgSendError);
                        }, 3000);
                        //debug += "TRUE\n";
                        break;
                    }
                    //debug += "false\n";
                }
            }
            //message.channel.send("```\n" + debug + "```").catch(core.msgSendError);

            wraskaWas = false;
        }
    }
}

module.exports =
{
    // Initialize plugin and here you can add custom Foxy's commands
    registerCommands:   registerCommands,
    // Catch incoming messages: you can make foxy be more talkative or implement a custom command handler from the raw text
    messageIn:          messageIn,
    messageUpdate:      messageUpdate
};

