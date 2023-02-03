
let core = undefined;


function dance(bot, message, args)
{
    message.channel.send({
        files: [{
            attachment: __dirname + "/../images/dance.gif",
            name: "dance.gif"
        }]
    }).catch(core.msgSendError);
}

function drill(bot, message, args)
{
    message.channel.send({
        files: [{
            attachment: __dirname + "/../images/drill.gif",
            name: "drill.gif"
        }]
    }).catch(core.msgSendError);
}

function imgSOS(bot, message, args)
{
    message.channel.send({
        files: [{
            attachment: __dirname + "/../images/SOS.gif",
            name: "dance.gif"
        }]
    }).catch(core.msgSendError);
}

function foxFace(bot, message, args)
{
    message.channel.send("https://wohlsoft.ru/images/foxybot/fox_face.png").catch(core.msgSendError);
}


function registerCommands(foxyCore)
{
    core = foxyCore;
    core.addCMD(["dance",    dance,            "Let's dance!!!"]);
    core.addCMD(["drill",    drill,            "Wanna drill hole?"]);
    core.addCMD(["sos",      imgSOS,           "HELP ME!!!"]);
    core.addCMD(["foxface",  foxFace,          "Wanna my face?"]);
}

module.exports =
{
    registerCommands:   registerCommands
};
