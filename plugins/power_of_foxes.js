var http             = require("http");
var https            = require("https");

var core = undefined;

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
            message.channel.sendMessage(randfox.file, core.msgSendError);
        }catch(e){
            core.sendErrorMsg(bot, message.channel, e);
            message.channel.sendMessage("```\nonResult: (" + statusCode + ")" + JSON.stringify(result) + "\n```", core.msgSendError);
        }
    });
}

var fox = function(bot, message, args)
{
    getRandFile(bot, message, "randomfox.php");
}

var fennec = function(bot, message, args)
{
    getRandFile(bot, message, "randomfennec.php");
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

var smile = function(bot, message, args)
{
    getRandFile(bot, message, "randomsmile.php");
}

var makeMe = function(bot, message, args)
{
    var argsL = args.toLowerCase();

    if(args.trim() == "")
        message.reply("Sorry, I can't: you wasn't told what I must do!", core.msgSendError);

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
        message.channel.sendMessage(":elephant:", core.msgSendError);

    if((argsL.indexOf("police") != -1) || (argsL.indexOf("cop") != -1))
        message.channel.sendMessage(":cop:", core.msgSendError);

    if((argsL.indexOf("butt") != -1) || (argsL.indexOf("ass") != -1))
        message.channel.sendMessage("`(_|_)`", core.msgSendError);

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
        message.channel.sendMessage(":poop:", core.msgSendError);

    if( (argsL.indexOf("sex") != -1) ||
        (argsL.indexOf("fuck") != -1) ||
        (argsL.indexOf("dick") != -1) ||
        (argsL.indexOf("vagina") != -1) ||
        (argsL.indexOf("penis") != -1) ||
        (argsL.indexOf("pennis") != -1) ||
        (argsL.indexOf("cunt") != -1) ||
        (argsL.indexOf("porn") != -1))
        message.reply("Never, you are stupid pervert! You are worst person I know here!", core.msgSendError);
}

var fart = function(bot, message, args)
{
    /* Inside moderator channel, take log file */
    if((message.channel.id == "215662579161235456") && (args == "debuglog"))
    {
        message.channel.sendFile("./foxybot-debug.log", "foxybot-debug.log").catch(core.msgSendError);
        return;
    }

    var isMyBoss = (core.botConfig.myboss.indexOf(message.author.id) != -1) || message.member.roles.has(core.botConfig.modsRole);

    if(isMyBoss && (args.indexOf("viva-systemd") != -1))
    {
        message.reply("I'll be back!", core.msgSendError);
        bot.setTimeout(function() { process.exit(1); }, 100);
        return;
    }

    /* Post a log file by email */
    if(isMyBoss && (args.indexOf("maillog") != -1))
    {
        core.sendEmailFile(message, message.content, {name: "./foxybot-debug.log", path: "foxybot-debug.log"}, false);
        message.reply("Wait for a letter, dude!", core.msgSendError);
        return;
    }

    getRandFile(bot, message, "randomfart.php");
}

var butts = function(bot, message, args)
{
    message.delete();
    message.channel.sendMessage("`(__|__)`").catch(core.msgSendError);
}

var burns = function(bot, message, args)
{
    message.channel.sendMessage("https://www.youtube.com/watch?v=gSzgNRzpjo8", core.msgSendError);
}

var spit = function(bot, message, args)
{
    if(args.indexOf("hot fire")!=-1)
    {
        burn(bot, message, args);
    } else {
        message.channel.sendMessage("https://www.youtube.com/results?search_query=" + encodeURIComponent("Spit " + args), core.msgSendError);
    }
}

var randMsg_messages = [
    "Hey, Knuxy, give to %u something, I forgot that at home...",
    "Sorry, %u, I forgot that at home, ask Knux for that please!",
    "/knux say /luna say %u, ping!"
];

var randMsg = function(bot, message, args)
{
    var msg = randMsg_messages[Math.floor(Math.random() * randMsg_messages.length)];
    message.channel.sendMessage(msg.replace(/%u/g, "<@!" + message.author.id + ">")).catch(core.msgSendError);
}

var randomCommand_available = [
    fox,    fennec,     boxy,       randMsg, burn,    burns,
    smile,  boat,       flower,     randMsg, ship,    fart,
    butts,  randMsg
];

var randomCommand = function(bot, message, args)
{
    var cmd = randomCommand_available[Math.floor(Math.random() * randomCommand_available.length)];
    cmd(bot, message, args);
}

function registerCommands(foxyCore)
{
    core = foxyCore;
    core.addCMD(["fox",      fox,              "Are you fan of the foxes :fox:? Just type \"/foxy fox\"!"]);
    core.addSynonimOf("fox", "foxy");
    core.addSynonimOf("fox", "🦊");

    core.addCMD(["fennec",      fennec,        "Are you fan of the desert foxes :fox:? Just type \"/foxy fennec\"!"]);
    core.addSynonimOf("fox", "fenec");
    core.addSynonimOf("fox", "desertfox");


    core.addCMD(["boxy",     boxy,             "I wish put something into it..."]);
    core.addSynonimOf("boxy", "box");
    core.addSynonimOf("boxy", "🗃");
    core.addCMD(["burn",     burn,             "BURN!!!"]);
    core.addCMD(["burns",    burns,            "BURN!!!"]);
    core.addSynonimOf("burn", "🔥",             "IT'S HOT!!!");
    core.addSynonimOf("burn", "fire",          "IT'S HOT!!!");
    core.addCMD(["smile",    smile,            "Take a random smile of the PGE Forums"]);
    core.addCMD(["boat",     boat,             "Wanna boat? I'll build it for you!"]);
    core.addCMD(["flower",   flower,           "Do you like flowers? I'll give them for you and friends :sunflower:!"]);
    core.addCMD(["ship",     ship,             "Seems you really with be a pirate, let's go, captain!"]);
    core.addCMD(["makeme",   makeMe,           "What are you wish make? Ship? Boat? Box? Fire?\n\n"+
                                          "__*Syntax:*__:\n\n"+
                                          " **/foxy make <any phraze contains any key word(s)>**\n\n" +
                                          "__*Full list things I can do (available key words):*__\n"+
                                          "ship, boat, fire, fox, box, flower, money, coin, cash, lego, elephant, police, cop, butt, ass, fart, gas, smoke, stink, smell, crap, dung, shit, poop."]);
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


