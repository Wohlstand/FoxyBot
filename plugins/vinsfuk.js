/*
    A dummy skeleton plugin. Created as simplest example of FoxyBot's plugin creation
*/

// Main module of FoxyBot
let core = undefined;
const Discord = require("discord.js");

function doGrant(message)
{
    let isMyBoss = (core.botConfig.myboss.indexOf(message.author.id) !== -1);
    let isModerator = false;

    if(core.botConfig.modsRole !== undefined && core.botConfig.modsRole.length > 0)
    {
        let mods = core.botConfig.modsRole;
        for(let i = 0; i < mods.length; ++i)
            isModerator |= message.member.roles.cache.has(mods[i]);
    }
    else
        isModerator = message.member.roles.cache.has(core.botConfig.modsRole);

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

let superBan = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    if(!doGrant(message))
        return;

    message.channel.sendTyping();

    message.guild.bans.fetch()
        .then(function ()
        {
            try
            {
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

                    let wasBanned = message.guild.bans.resolve(id);
                    if(wasBanned == null)
                    {
                        testOut += "* Banned id=" + id + " -> " + reason + "\n";
                        message.guild.bans.create(id, {reason: reason})
                            .then(function (banInfo)
                            {
                                console.log(`Banned user: ${banInfo.user?.tag ?? banInfo.tag ?? banInfo}`);
                            })
                            .catch(core.msgSendError);
                    }
                }

                if(testOut === "")
                    testOut = "All users from the sent list were already banned"
                else
                    testOut = "IDs has been banned: \n\n" + testOut;

                if(testOut.length >= 2000)
                    testOut = testOut.substring(0, 2000-4) + "...";

                message.channel.send(testOut).catch(core.msgSendError);
            }
            catch(e)
            {
                core.foxyLogInfo("Error happen! " + e.name + ":" + e.message);
            }
        })
        .catch(core.foxyLogInfo);
}

let superBanFromDB = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    if(!doGrant(message))
        return;

    if(core.my_db === undefined || core.my_db === null)
    {
        message.channel.send("I can't access database server at all. Please fix me, I need a doctor!").catch(core.msgSendError);
        return; // Can't write database at all
    }

    message.channel.sendTyping();

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

                    message.guild.bans.fetch()
                        .then(function ()
                        {
                            try
                            {
                                let testOut = ""

                                for(let i = 0; i < results.length; i++)
                                {
                                    let wasBanned = message.guild.bans.resolve(results[i].userid);
                                    if(wasBanned == null)
                                    {
                                        message.guild.bans.create(results[i].userid, {reason: results[i].reason})
                                            .then(function (banInfo)
                                            {
                                                console.log(`Banned user: ${banInfo.user?.tag ?? banInfo.tag ?? banInfo}`);
                                            })
                                            .catch(core.msgSendError);
                                        testOut += "* Banned id=" + results[i].userid + " -> " + results[i].reason + "\n";
                                    }
                                }

                                if(testOut === "")
                                    testOut = "All users from the blacklist were already banned"
                                else
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
                                core.sendErrorMsg(bot, message.channel, e);
                            }
                        })
                        .catch(core.foxyLogInfo);
                }
                catch(e)
                {
                    core.foxyLogInfo("Error happen! " + e.name + ":" + e.message);
                }
            });
    }
    catch(e)
    {
        core.foxyLogInfo("Error happen! " + e.name + ":" + e.message);
    }
}

let tagBan = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    if(!doGrant(message))
        return;

    let idBegin;
    let reasonBegin = -1;

    idBegin = args.indexOf(" ");
    if(idBegin !== -1)
        reasonBegin = args.indexOf(" ", idBegin + 1);

    if(idBegin === -1)
    {
        message.channel.send("Invalid format!\n" +
            "Valid format:\n" +
            "```\n" +
            "/foxy tagban [tag] [id] [reason text]\n" +
            "```\n" +
            "All arguments were required.").catch(core.msgSendError);
        return;
    }

    let tag = args.substring(0, idBegin);
    let toKill = reasonBegin >= 0 ? args.substring(idBegin + 1, reasonBegin) : args.substring(idBegin + 1);
    let reason = reasonBegin >= 0 ? args.substring(reasonBegin + 1) : "<Reason is not specified>";

    if(tag === "dryrun")
    {
        message.channel.send("Test of command: ban by\n" +
            "tag: " + tag + "\n" +
            "id: " + toKill + "\n" +
            "reason: " + reason).catch(core.msgSendError);
        return;
    }

    message.channel.sendTyping();

    try
    {
        let myDb = core.my_db;

        myDb.query('SELECT * FROM foxy_superban_list WHERE userid=' + myDb.escape(toKill) + ';',
            function (error, results, fields)
            {
                try
                {
                    if(error)
                    {
                        core.foxyLogInfo("Error happen! " + error);
                        return;
                    }

                    if(results.length > 0)
                    {
                        message.channel.send("I can't: User <@!" + toKill + "> is already in a blacklist by tag **" + results[0].tag + "** for a reason:\n" +
                            "```\n" +
                            results[0].reason + "\n" +
                            "```\n").catch(core.msgSendError);
                        return;
                    }

                    message.channel.send("Here we go: User <@!" + toKill + "> will be added into blacklist by tag **" + tag + "** and banned on multiple servers for a reason:\n" +
                        "```\n" +
                        reason + "\n" +
                        "```\n").catch(core.msgSendError);

                    let insertQuery =   "INSERT INTO foxy_superban_list (`userid`, `reason`, `tag`) " + "values (" + myDb.escape(toKill) + ", " + myDb.escape(reason) + ", " + myDb.escape(tag) + ");";
                    myDb.query(insertQuery, function (error, results, fields)
                    {
                        if(error)
                        {
                            core.errorMyDb(error, results, fields);
                            return;
                        }

                        myDb.query("SELECT * FROM foxybot.foxy_superban_tags WHERE tag=" + myDb.escape(tag) + ";",
                            function (error, results, fields)
                            {
                                if(error)
                                {
                                    core.errorMyDb(error, results, fields);
                                    return;
                                }

                                try
                                {
                                    let outText = "";

                                    for(let i = 0; i < results.length; ++i)
                                    {
                                        let res = results[i];
                                        let guild = bot.guilds.resolve(res.autoban_guild);
                                        let channel = null;

                                        if(guild == null)
                                        {
                                            outText += "-!! Guild " + res.autoban_guild + " seens inacessible or invalid (info: " + res.info + ")\n";
                                            continue;
                                        }

                                        channel = bot.channels.resolve(res.autoban_logchan);

                                        if(channel == null)
                                            outText += "-!! Channel " + res.autoban_logchan  + " of guild " + guild.name + " seens inacessible or invalid (info: " + res.info + ")\n";
                                        else if(channel.type !== Discord.ChannelType.GuildText)
                                            outText += "-!! Channel " + channel.name  + " of guild " + guild.name + " is not a text channel (de-facto " + channel.type + ") (info: " + res.info + ")\n";
                                        else
                                        {
                                            guild.bans.create(toKill, {reason: reason})
                                                .then(function (banInfo)
                                                {
                                                    let report = "I banned the <@" + toKill + "> with tag **" + tag + "** for the next reason:\n" +
                                                        "```\n" +
                                                        reason +
                                                        "```\n" +
                                                        "**Moderator:** " + message.author.username + "#" + message.author.discriminator + "\n" +
                                                        "**Where banned originally:** " + message.guild.name;
                                                    channel.send(report).catch(core.msgSendError);
                                                    console.log(`Banned user: ${banInfo.user?.tag ?? banInfo.tag ?? banInfo} at ${guild.name}`);
                                                })
                                                .catch(function(error)
                                                {
                                                    channel.send("I can't ban user <@" + toKill + "> with tag **" + tag + "** because of error: " + error.message).catch(core.msgSendError);
                                                    console.log("Failed to ban user <@" + toKill + "> for the reason: " + error.message);
                                                });

                                            outText += "- Banned at " + guild.name + ", reported at channel **" + channel.name + "** (info: " + res.info + ")\n";
                                        }
                                    }

                                    if(outText === "")
                                        outText = "No guilds found by tag **" + tag + "** to ban";
                                    else
                                        outText = "User <@!" + toKill + "> will be banned in next guilds: \n\n" + outText;

                                    if(outText.length >= 2000)
                                        outText = outText.substring(0, 2000-4) + "...";

                                    let channel = message.channel;
                                    if(channel === undefined)
                                        core.foxyLogInfo("Error happen! the channel is unavailable!");
                                    else
                                    {
                                        message.channel.send(outText).catch(core.msgSendError);
                                    }
                                }
                                catch (e)
                                {
                                    core.sendErrorMsg(bot, message.channel, e);
                                }
                            }
                        );
                    });
                }
                catch(e)
                {
                    core.foxyLogInfo("Error happen! " + e.name + ":" + e.message);
                }
            });
    }
    catch(e)
    {
        core.foxyLogInfo("Error happen! " + e.name + ":" + e.message);
    }
}

function guildMemberAdd(/*Client*/ bot, /*GuildMember*/ guildMember)
{
    if(core.my_db === undefined || core.my_db === null)
    {
        core.foxyLogError("I can't access database server at all. Please fix me, I need a doctor!");
        return; // Can't write database at all
    }

    let guildName = guildMember.guild.name;
    let guildId = guildMember.guild.id;
    let guildUserId = guildMember.user.id;

    try
    {
        let myDb = core.my_db;
        let autoBanQuery = '' +
            'SELECT * FROM foxy_superban_list,foxy_superban_tags WHERE ' +
            'userid=' + myDb.escape(guildUserId) +
            'AND autoban_guild=' + myDb.escape(guildId) +
            'AND foxy_superban_list.tag=foxy_superban_tags.tag;';

        myDb.query(autoBanQuery,
            function (error, results, fields)
            {
                try
                {
                    if(error)
                    {
                        core.foxyLogInfo("Error happen! " + error);
                        return;
                    }

                    if(results.length > 0)
                    {
                        let res = results[0];
                        core.foxyLogInfo("Caught a jerk to his ass! I going to ban them as fast as possible!");
                        let guildName = guildMember.guild.name;
                        let guildUserId = guildMember.user.id;

                        let channel = bot.channels.resolve(res.autoban_logchan);

                        guildMember.guild.bans.create(guildUserId, {reason: "FoxyBot: Banned automatically through a blacklist"})
                        .then(function (banInfo)
                        {
                            if (channel)
                            {
                                let report = "I automatically banned the <@" + guildUserId + "> with tag **" + res.tag + "** as it was found in the blacklist.";
                                channel.send(report).catch(core.msgSendError);
                            }
                            console.log(`Banned user: ${banInfo.user?.tag ?? banInfo.tag ?? banInfo} at ${guildName}`);
                        })
                        .catch(function(error)
                        {
                            channel.send("I can't ban user <@" + guildUserId + "> with tag **" + res.tag + "** because of error: " + error.message).catch(core.msgSendError);
                            console.log("Failed to ban user <@" + guildUserId + "> for the reason: " + error.message);
                        });
                        return;
                    }

                    core.foxyLogInfo("Seems this user is not in a blacklist...");
                }
                catch(e)
                {
                    core.foxyLogInfo("Error happen! " + e.name + ":" + e.message);
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
    core.addCMD(["superban",            superBan,           "Ban multiple users at once"]);
    core.addCMD(["superbanfromdb",      superBanFromDB,     "Ban all users from the database list"]);
    core.addCMD(["tagban",              tagBan,             "Add user into database list, and ban them by list of servers by tag"]);
}

module.exports =
{
    // Initialize plugin and here you can add custom Foxy's commands
    registerCommands:   registerCommands,
    // Catch the newbie joining
    guildMemberAdd:     guildMemberAdd
};
