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
    if(array == null)
        return {index:null, value:null};
    else
    {
        let id = Math.floor(Math.random() * (array.length));
        let val = array[id];
        return {index:id, value:val}
    }
}

let roboloeSpeech = [
    "/minnie anime",
    "/minnie dance",
    "/minnie kawaii"
];

// let roboloeSpeech = [
//      "/luna senpai",
//      "/luna sempai",
//      "/luna fart",
//      "/luna farts",
//      "/luna butt",
//      "/luna butts",
//      "/luna dank",
//      "/luna chan",
//      "/luna kun",
//      "/luna tan",
//      "/luna yotsuba",
//      "/luna lewd",
//      "/luna frogsuit",
//      "/luna kawaii"
// ];

let sheIsWraska =
[
    "I saw this lot of times... Let's enjoy a cute Wraska!",
    ".... boring! :expressionless:\n" +
        "Wraska, come here!",
    "Maybe you will stop to post this anime post again? Wraska, please show your beauty to everyone!",
    "Roboloe, do you Wanna a good Anime? Why not to visit Japan!\n" +
        "Oh, hello Wraska :3"
];

let wraskaIsKawaii =
[
    "Wraska is kawaii!",
    "I'll say that Wraska is really kawaii!",
    "Let's Wraska review that :3",
    "Wraska is kawaii forever!",
    "I think, the true kawaii is Wraska!"
];

let myHealfIsFine = [
    "I'm not broken. You are broken: you have annoyed us with your dumb anime!",
     "I recently was at my doctor, and he told I'm fine! I suggesting you to do same!",
     "Why I'm sick? So, you aren't a doctor to tell me that I'm sick... " +
        "Can you check your health instead of mine?",
     "I was sick some time ago, but now I'm fine! :3",
     "Broken? You want to say 'sick'? Sorry, but my doctor says I'm fine!"
];

let furiesAreBest = [
    "I want to see more furries than anime!",
     "Anime is no more actual, Furries are best choice for now!"
];

let obnoxiusRobo = [
    "Mayby you will stop to post anime?",
    "Robo, you are looking more obnoxious than me with that annoying anime!",
    "Look to yourself, crazy anime bot!"
];

let lunaOffline = [
    "Robo, do you know that Minnie is asleep! Please don't disturb her, stupid machine!",
    "Shhh! Don't be loud, Minnie is asleep!",
    "Don't try to disturb sleeping Minnie, or I'll bite you!",
    "Robo, are you blind? Minnie is sleeping!",
    "Oh no, Robo, don't try to disturb Minnie, she will be so angry...",
    "Hoeloe, please explain to this stupid robot that Minnie is sleeping, he don't wanna understand this!!!"
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
         "You are wasting more time by posting anime things from Minnie's outdated collection, why not to post something different than Anime?",
         "Everyone, does Wraska wastes your time? Or you are prefer to see a boring outdated Minnie's anime collection?"]
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
        //let Luna = mybot.users.resolve("216273975939039235");
        let minnie = mybot.users.resolve("411534588251340806");
        if(minnie && minnie.presence.status === "offline")
            return false;
    }
    catch(e)
    {
        core.sendErrorMsg(mybot, message.channel, e);
        return false;
    }
    return true;
}

let wraskaWas = false;

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
        if(msgTrimmed === "/minnie kawaii")
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
            }
            else
            {
                message.channel.send(getArrayRandom(lunaOffline).value).catch(core.msgSendError);
                wraskaWas = true;
            }
        }
        else
        {
            let messageSent = false;

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

