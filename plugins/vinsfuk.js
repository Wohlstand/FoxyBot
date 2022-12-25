/*
    A dummy skeleton plugin. Created as simplest example of FoxyBot's plugin creation
*/

// Main module of FoxyBot
let core = undefined;

// Example bot command
let superBan = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    let isMyBoss = (core.botConfig.myboss.indexOf(message.author.id) !== -1);
    let isModerator = message.member.roles.cache.has(core.botConfig.modsRole);

    if(!isMyBoss && !isModerator)
    {
        message.channel.send("Doesn't work for you, ordinary user!")
            .catch(core.msgSendError);
        return; // Nobody can use this command!
    }

    if(message.guild === undefined || message.guild === null)
    {
        message.channel.send("Doesn't work at DM!")
            .catch(core.msgSendError);
        return; // Doesn't work outside the server
    }

    let list = args.split("\n");
    let testOut = ""

    for(let i = 0; i < list.length; ++i)
    {
        let firstSpace = list[i].indexOf(" ");
        let reason;
        let id;
        if(firstSpace === -1)
            id = list[i];
        else
        {
            id = list[i].substring(0, firstSpace);
            reason = list[i].substring(firstSpace + 1);
        }

        testOut += "* Banned id=" + id + " -> " + reason + "\n";
        message.guild.bans.create(id, {reason: reason})
            .catch(core.msgSendError);
    }

    testOut = "IDs has been banned: \n\n" + testOut;

    if(testOut.length >= 2000)
        testOut = testOut.substring(0, 2000-4) + "...";

    message.channel.send("IDs has been banned: \n\n" + testOut)
        .catch(core.msgSendError);
}

// Initialize plugin and here you can add custom Foxy's commands
function registerCommands(/*bot_commands.js module*/ foxyCore)
{
    core = foxyCore;
    // Command structure:
    // name[0] {string}
    // function(bot,msg,args)[1] {function pointer}
    // help[2], {string}
    // synonims[3], {array of strings}
    // isUseful[4], {bool}
    // limitOnGuilds[5] {array of strings}
    core.addCMD(["superban",      superBan,           "Ban multiple users at once"]);
}

module.exports =
{
    // Initialize plugin and here you can add custom Foxy's commands
    registerCommands:   registerCommands
};
