/*
    Automatical reply to Roboloe when it does "/luna kawaii" after few seconds
*/

// Main module of FoxyBot
var core = undefined;

// Initialize plugin and here you can add custom Foxy's commands
function registerCommands(/*bot_commands.js module*/ foxyCore)
{
    core = foxyCore;
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

var roboloeSpeech = [
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

var sheIsWraska =
[
    "I saw this lot of times... Let's enjoy a cute Wraska instead of this!",
    ".... boring! :expressionless:\nWraska, come here!",
    "Maybe you will stop to post this anime post again? Wraska, please show your beauty to everyone!",
    "Hey, Knux, please ask Wraska to come here while I kicking to Roboloe's ass...\nNo? Okay, You better can kick his ass than me.\nAnyway, Wraska is already here!",
    "Roboloe, do you Wanna a good Anime? Go to Japen!\nOh, hello Wraska :3",
    "Anime from Luna's collection is not better than Hayao Miyazaki's Anime, Wraska can confirm than :3",
    ".... Boring and Annoying!\nI better watch something Hayao Miyazaki's together with Wraska!"
];

var wraskaIsKawaii =
[
    "No one anime girl kawaii more than Wraska Snowy Fox",
    "You are not kawaii, Wraska is kawaii!",
    "No, you are not kawaii!\nWraska is kawaii!",
    "No, you are not kawaii!\nWraska can confirm that :3",
    "Robo, you will never be kawaii!\nWraska is kawaii forever!",
    "I don't think this is kawaii... Let's see true kawaii - Wraska!"
];

var roboloeTalkTable = [
    ["okay maybe foxy is actually broken",
        ["I'm not broken. You are broken: you have annoyed us with your dumb anime!",
         "I recently was at my doctor, and he told I'm fine! I suggesting you to do same!",
         "Why I'm sick? So, you are not a doctor to tell me that I'm sick... Can you check your health instead of mine?",
         "I was sick some time ago, but now I'm fine! :3",
         "Broken? You want to say 'sick'? Sorry, but my doctor says I'm fine!"]
    ],
    ["Why does foxy occasionally post that?",
        ["I want to see more furries than anime!",
         "Anime is no more actual, Furries are best choice for now!"]
    ],
    ["Why does foxy occasionally post this?",
        ["I want to see more furries than anime!",
         "Anime is no more actual, Furries are best choice for now!"]
    ],
    ["i find foxy more obnoxious by a long shot",
        ["Mayby you will stop to post anime?",
         "Robo, you are looking more obnoxious than me with that annoying anime!",
         "Look to yourself, crazy anime bot!",
         "Hey, Knux, please kick that anime bot to his metallic ass!"]
    ],
    ["i find foxy way more obnoxious by a long shot",
        ["Mayby you will stop to post anime?",
         "Robo, you are looking more obnoxious than me with that annoying anime!",
         "Look to yourself, crazy anime bot!",
         "Hey, Knux, please kick that anime bot to his metallic ass!"]
    ],
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
    ]
];

var wraskaWas = false;

// Catch incoming messages: you can make foxy be more talkative or implement a custom command handler from the raw text
function messageIn(/*Client*/ bot, /*Message*/ message, /*bool*/ channelIsWritable)
{
    var msgTrimmed      = message.content.trim();
    if(channelIsWritable && (message.author.id == 320247723641012235)) //It's me: 182039820879659008, when I wanna play Roboloe
    {
        if(msgTrimmed == "/luna kawaii")
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
        }
        else
        if(roboloeSpeech.indexOf(msgTrimmed) != -1)
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
            var messageSent = false;

            if(wraskaWas)
            {
                if(msgTrimmed == "that's firstly not true")
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

                if(msgTrimmed == "im kawaii")
                {
                    setTimeout(function()
                    {
                        message.reply("Really?! Give a proof please :3", core.msgSendError);
                    }, 3500);
                    messageSent = true;
                }

                if(msgTrimmed == "yeah")
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
                for(var i = 0; i < roboloeTalkTable.length; i++)
                {
                    //debug += "'" + msgTrimmed + "' == '" + roboloeTalkTable[i][0] + "' ";
                    if(msgTrimmed.indexOf(roboloeTalkTable[i][0]) != -1)
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
    messageIn:          messageIn
};

