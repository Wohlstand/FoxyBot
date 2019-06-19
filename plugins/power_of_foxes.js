let http             = require("http");
let https            = require("https");
let exec = require('child_process').execFile;

let core = undefined;

function getJSON(options, onResult)
{
    //foxyLogInfo("rest::getJSON");
    var prot = options.port === 443 ? https : http;
    var req = prot.request(options,
    function(res)
    {
        let output = '';
        //foxyLogInfo(options.host + ':' + res.statusCode);
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
}

function getRandFile(bot, message, fromURL, messageTitle="", messageColor=0xD77D31)
{
    let options = {
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
            message.channel.send(messageTitle,
                {
                    embed:
                    {
                        image: {
                            url: randfox.file
                        },
                        color: messageColor,
                    }, split: true,
                    reply : ""
                }
            ).catch(core.msgSendError);
        }catch(e){
            core.sendErrorMsg(bot, message.channel, e);
            message.channel.send("```\nonResult: (" + statusCode + ")" + JSON.stringify(result) + "\n```", {"reply": ""}).catch(core.msgSendError);
        }
    });
}

function fox(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=foxes,fennecs,vraskafox", ":fox: | **Your random fox:**", 0xD77D31);
}

function foxart(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=foxarts", ":fox: | **Your random fox art:**", 0xD77D31);
}

function fennec(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=fennecs", ":fox: | **Fennec is here:**", 0xF7EAE1);
}

function wraska(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=vraskafox", ":fox: | **It's Vraska the snowy fox:**", 0xFFFFFF);
}

function paw(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=paws", ":feet:", 0xD77D31);
}

function boxy(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=boxes", ":card_box: | **Just a box with some:**", 0x946B54);
}

function boat(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=boats", ":rowboat: | **Do you wanna fishing?**", 0xFFFFFF);
}

function ship(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=ships", ":ship: | **Ship is here:**", 0xBC987E);
}

function flower(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=flowers", ":rose: | **Do you like flowers?**", 0xA52A2A);
}

function burn(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=burn", ":fire: | **It's hot!**", 0xFF7F49);
}

function money(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=money", ":moneybag: | **You are rich!**", 0xB8860B);
}

function lego(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=lego", ":sun_with_face: | **Lego!**", 0x5E2129);
}

function smile(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=smiles");
}

function facepalm(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=facepalm");
}

function frog(bot, message, args)
{
    getRandFile(bot, message, "getRandPic.php?which=frogs", ":frog: | **I see fly!**", 0x8CCB5E);
}


function makeMe(bot, message, args)
{
    var argsL = args.toLowerCase();

    if(args.trim() === "")
        message.reply("Sorry, I can't: you wasn't told what I must do!", core.msgSendError);

    if(argsL.indexOf("ship") !== -1)
        ship(bot, message, args);

    if(argsL.indexOf("boat") !== -1)
        boat(bot, message, args);

    if(argsL.indexOf("fire") !== -1)
        burn(bot, message, args);

    if(argsL.indexOf("fox") !== -1)
        fox(bot, message, args);

    if(argsL.indexOf("paw") !== -1)
        paw(bot, message, args);

    if((argsL.indexOf("vraska") !== -1) || (argsL.indexOf("wraska") !== -1))
        wraska(bot, message, args);

    if(argsL.indexOf("frog") !== -1)
        frog(bot, message, args);

    if(argsL.indexOf("lego") !== -1)
        lego(bot, message, args);

    if(argsL.indexOf("box") !== -1)
        boxy(bot, message, args);

    if(argsL.indexOf("flower") !== -1)
        flower(bot, message, args);

    if((argsL.indexOf("money") !== -1) || (argsL.indexOf("coin") !== -1) || (argsL.indexOf("cash") !== -1))
        money(bot, message, args);

    if(argsL.indexOf("elephant") !== -1)
        message.channel.send(":elephant:").catch(core.msgSendError);

    if((argsL.indexOf("police") !== -1) || (argsL.indexOf("cop") !== -1))
        message.channel.send(":cop:").catch(core.msgSendError);

    if((argsL.indexOf("butt") !== -1) || (argsL.indexOf("ass") !== -1))
        message.channel.send("`(_|_)`").catch(core.msgSendError);

    if( (argsL.indexOf("fart") !== -1) ||
        (argsL.indexOf("gas") !== -1)  ||
        (argsL.indexOf("smoke") !== -1) ||
        (argsL.indexOf("stink") !== -1) ||
        (argsL.indexOf("smell") !== -1) )
        fart(bot, message, args);

    if( (argsL.indexOf("crap") !== -1) ||
        (argsL.indexOf("dung") !== -1) ||
        (argsL.indexOf("shit") !== -1) ||
        (argsL.indexOf("poop") !== -1) )
        message.channel.send(":poop:").catch(core.msgSendError);

    if( (argsL.indexOf("sex") !== -1) ||
        (argsL.indexOf("fuck") !== -1) ||
        (argsL.indexOf("dick") !== -1) ||
        (argsL.indexOf("vagina") !== -1) ||
        (argsL.indexOf("penis") !== -1) ||
        (argsL.indexOf("pennis") !== -1) ||
        (argsL.indexOf("cunt") !== -1) ||
        (argsL.indexOf("porn") !== -1))
        message.reply("Never, you are stupid pervert! You are worst person I know here!").catch(core.msgSendError);
}

function fart(bot, message, args)
{
    /* Inside moderator channel, take log file */
    if((message.channel.id === "215662579161235456") && (args === "debuglog"))
    {
        message.channel.sendFile("./foxybot-debug.log", "foxybot-debug.log").catch(core.msgSendError);
        return;
    }

    let isMyBoss = (core.botConfig.myboss.indexOf(message.author.id) !== -1) || message.member.roles.has(core.botConfig.modsRole);

    if(isMyBoss && (args.indexOf("viva-systemd") !== -1))
    {
        message.reply("I'll be back!", core.msgSendError);
        bot.user.setStatus("idle")
            .catch(core.foxyLogError);
        bot.user.setActivity("Shuting down...")
            .catch(core.foxyLogError);
        setTimeout(function()
        {
            bot.destroy().catch(core.foxyLogError);
            setTimeout(function()
            {
                process.exit(1);
            }, 1000);
        }, 1000);
        return;
    }

    if(isMyBoss && (args.indexOf("mailtest") !== -1))
    {
        core.sendEmailRaw(bot, message, message.content);
        return;
    }

    /* Post a log file by email */
    if(isMyBoss && (args.indexOf("maillog") !== -1))
    {
        core.sendEmailFile(message, message.content, {name: "./foxybot-debug.log", path: "foxybot-debug.log"}, false);
        message.reply("Wait for a letter, dude!", core.msgSendError);
        return;
    }

    if(isMyBoss && (args.indexOf("pullmaster") !== -1))
    {
        exec('git', ["pull", "origin", "master"], {cwd: "."}, function(err, data)
        {
            if(err == null)
            {
                message.reply("git pull origin master\n```\n" + data.toString() + "\n```\n");
                exec('npm', ["install"], {cwd: "."}, function(err, data)
                {
                    if(err)
                        message.reply("ERROR of npm install```\n" + err + "\n\n" + data.toString() + "\n```\n");
                    else
                        message.reply("npm install\n```\n" + data.toString() + "\n```\n");
                });
            }
            else
            {
                message.reply("ERROR of git pull origin master```\n" + err + "\n\n" + data.toString() + "\n```\n");
                exec('git', ["merge", "--abort"], {cwd: "."}, function(err, data){});
            }
        });
        return;
    }

    getRandFile(bot, message, "getRandPic.php?which=farts");
}

function butts(bot, message, args)
{
    message.delete();
    message.channel.send("`(__|__)`").catch(core.msgSendError);
}

function burns(bot, message, args)
{
    message.channel.send("https://youtube.com/watch?v=gSzgNRzpjo8").catch(core.msgSendError);
}

function spit(bot, message, args)
{
    if(args.indexOf("hot fire") !== -1)
    {
        burn(bot, message, args);
    } else {
        message.channel.send("https://www.youtube.com/results?search_query=" + encodeURIComponent("Spit " + args)).catch(core.msgSendError);
    }
}

let randMsg_messages = [
    "Hey, Knuxy, give to %u something, I forgot that at home...",
    "Sorry, %u, I forgot that at home, ask Knux for that please!",
    "/knux say /luna say %u, ping!"
];

function randMsg(bot, message, args)
{
    let msg = randMsg_messages[core.getRandomInt(0, randMsg_messages.length - 1)];
    message.channel.send(msg.replace(/%u/g, "<@!" + message.author.id + ">")).catch(core.msgSendError);
}

let randomCommand_available = [
    fox,    fennec,     boxy,       randMsg, burn,    burns,
    smile,  boat,       flower,     randMsg, ship,    fart,
    butts,  randMsg
];

function randomCommand(bot, message, args)
{
    let cmd = randomCommand_available[core.getRandomInt(0, randomCommand_available.length - 1)];
    cmd(bot, message, args);
}

function registerCommands(foxyCore)
{
    core = foxyCore;
    core.addCMD(["fox",      fox,              "Are you fan of the foxes :fox:? Just type \"/foxy fox\"!"]);
    core.addSynonimOf("fox", "foxy");
    core.addSynonimOf("fox", "🦊");
    core.fox = fox;//Add Fox as function to use in another plugins

    core.addCMD(["foxart",      foxart,        "Do you like fox arts :fox:? Just type \"/foxy foxart\"!"]);

    core.addCMD(["fennec",      fennec,        "Are you fan of the desert foxes :fox:? Just type \"/foxy fennec\"!"]);
    core.addSynonimOf("fennec", "fenec");
    core.addSynonimOf("fennec", "desertfox");

    core.addCMD(["paws",        paw,           "Do you like paws :feet:? Just type \"/foxy paws\"!"]);
    core.addSynonimOf("paws",   "paw");

    core.addCMD(["wraska",      wraska,        "You still don't know who is a Wraksa the Fox? Just type \"/foxy wraska\"!"]);
    core.addSynonimOf("wraska", "vraska");
    core.addSynonimOf("wraska", "враска");
    core.wraska = wraska;//Add Wraska as function to use in another plugins

    core.addCMD(["facepalm",    facepalm,      "D'oh! :face_palm:"]);
    core.addSynonimOf("facepalm", "palm");
    core.addSynonimOf("facepalm", "sigh");

    core.addCMD(["frog",    frog,      "Quaaaa, Quaaaa.... Quaaaaa! :frog:"]);
    core.addSynonimOf("frog", "froggie");
    core.addSynonimOf("frog", "toad");

    core.addCMD(["boxy",     boxy,             "I wish put something into it..."]);
    core.addSynonimOf("boxy", "box");
    core.addSynonimOf("boxy", "🗃");
    core.addCMD(["burn",     burn,             "BURN!!!"]);
    core.addCMD(["burns",    burns,            "BURN!!!"]);
    core.addSynonimOf("burn", "🔥",              "IT'S HOT!!!");
    core.addSynonimOf("burn", "fire",          "IT'S HOT!!!");
    core.addCMD(["smile",    smile,            "Take a random smile of the PGE Forums"]);
    core.addCMD(["boat",     boat,             "Wanna boat? I'll build it for you!"]);
    core.addCMD(["flower",   flower,           "Do you like flowers? I'll give them for you and friends :sunflower:!"]);
    core.addCMD(["ship",     ship,             "Seems you really with be a pirate, let's go, captain!"]);
    core.addCMD(["makeme",   makeMe,           "What are you wish make? Ship? Boat? Box? Fire?\n\n"+
                                          "__*Syntax:*__:\n\n"+
                                          " **/foxy make <any phraze contains any key word(s)>**\n\n" +
                                          "__*Full list things I can do (available key words):*__\n"+
                                          "ship, boat, fire, fox, box, flower, frog, money, coin, cash, lego, elephant, police, cop, butt, ass, fart, gas, smoke, stink, smell, crap, dung, shit, poop."]);
    core.addSynonimOf("makeme", "make");
    core.addSynonimOf("makeme", "create");
    core.addSynonimOf("makeme", "build");
    core.addSynonimOf("makeme", "produce");
    core.addSynonimOf("makeme", "give");

    core.addCMD(["spit",     spit,             "I'll spit anything you request!\n__*Syntax:*__ spit <any your text>"]);

    core.addCMD(["fart",     fart,             "Ow.... :poop:"]);
    core.addSynonimOf("fart", "farts");
    core.addCMD(["butt",     butts,            "You are pervent!"]);
    core.addSynonimOf("butt", "butts");

    core.addCMD(["surprise", randomCommand,    "Do you wanna surprise? I'll give you a random gift!"]);

    core.addSynonimOf("surprise", "mischief");
    core.addSynonimOf("surprise", "meepyglobix");
}

module.exports =
{
    registerCommands:   registerCommands
};
