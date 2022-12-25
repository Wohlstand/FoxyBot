/*
    A dummy skeleton plugin. Created as simplest example of FoxyBot's plugin creation
*/

// Main module of FoxyBot
let core = undefined;

function doGrant(message)
{
    let isMyBoss = (core.botConfig.myboss.indexOf(message.author.id) !== -1);
    let isModerator = message.member.roles.cache.has(core.botConfig.modsRole);

    if(!isMyBoss && !isModerator)
    {
        message.channel.send("Doesn't work for you, ordinary user!")
            .catch(core.msgSendError);
        return false; // Nobody can use this command!
    }

    if(message.guild === undefined || message.guild === null)
    {
        message.channel.send("Doesn't work at DM!")
            .catch(core.msgSendError);
        return false; // Doesn't work outside the server
    }

    return true;
}

// Example bot command
let superBan = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    if(!doGrant(message))
        return;

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

// Example bot command
let superBanFromDB = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    if(!doGrant(message))
        return;

    try
    {
        let myDb = core.my_db;
        myDb.query('SELECT * FROM foxy_superban_list;',
            function (error, results, fields)
            {
                try
                {
                    if(error)
                    {
                        core.foxyLogInfo("Error happen! " + error);
                        return;
                    }

                    let testOut = ""

                    for(let i = 0; i < results.length; i++)
                    {
                        message.guild.bans.create(results[i].userid, {reason: results[i].reason})
                            .then(function(banInfo)
                            {
                                console.log(`Banned user: ${banInfo.user?.tag ?? banInfo.tag ?? banInfo}`);
                            })
                            .catch(core.msgSendError);
                        testOut += "* Banned id=" + results[i].userid + " -> " + results[i].reason + "\n";
                    }

                    testOut = "IDs has been banned: \n\n" + testOut;

                    if(testOut.length >= 2000)
                        testOut = testOut.substring(0, 2000-4) + "...";

                    let channel = message.channel;
                    if(channel === undefined)
                        core.foxyLogInfo("Error happen! the channel is unavailable!");
                    else
                    {
                        message.channel.send(testOut).catch(core.msgSendError);
                    }
                }
                catch(e)
                {
                    core.sendErrorMsg(bot, chan, e);
                }
            });
    }
    catch(e)
    {
        core.foxyLogInfo("Error happen! " + e.name + ":" + e.message);
    }
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
    core.addCMD(["superbanfromdb",      superBanFromDB, "Ban all users from the database list"]);
}

module.exports =
{
    // Initialize plugin and here you can add custom Foxy's commands
    registerCommands:   registerCommands
};
