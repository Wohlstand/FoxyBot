/*
    A dummy skeleton plugin. Created as simplest example of FoxyBot's plugin creation
*/

// Main module of FoxyBot
let core = undefined;

function doGrant(message)
{
    if(!core)
    {
        message.channel.send("Doesn't work, yet!").catch(core.msgSendError);
        return;
    }

    let isMyBoss = (core.botConfig.myboss.indexOf(message.author.id) !== -1);
    let isModerator = false;

    if(core.botConfig.modsRoles !== undefined && core.botConfig.modsRoles.length > 0)
    {
        let mods = core.botConfig.modsRoles;
        for(let i = 0; i < mods.length; ++i)
        {
            let rol = mods[i];
            isModerator |= message.member.roles.cache.has(rol);
        }
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

// Example bot command
let cleanUpMessages = function(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    if(!doGrant(message))
        return;

    let args_l = args.split(" ");

    let del_by_user_id = null;
    let del_number = 0;
    let del_around_msg_id = "";

    if(args_l.length < 1)
    {
        message.channel.send("Invalid format!\n" +
            "Valid format:\n" +
            "```\n" +
            "/foxy clean [number of messages] [id of user whom clean-up] [optional relative id of message where around to seek]\n" +
            "```").catch(core.msgSendError);
        return;
    }

    del_number = args_l[0] === "all" ? -1 : parseInt(args_l[0]);

    if(args_l.length >= 2)
        del_by_user_id = args_l[1];

    if(args_l.length >= 3)
        del_around_msg_id = args_l[1];

    let setup = del_number > 1 ? {limit: del_number, cache: false} : {};
    if(del_around_msg_id !== "")
        setup.around = del_around_msg_id;

    message.channel.messages.fetch(setup)
        .then(function(messages)
        {
            console.log("Cleaning up " + messages.size + " messages...");
            let counter = 0;
            messages.forEach((message) =>
            {
                if(!del_by_user_id || del_by_user_id === message.author.id)
                {
                    message.delete().catch(core.msgSendError);
                    console.log("Deleted message " + (++counter) + "...");
                }
            });
        })
        .catch(core.msgSendError);

    message.delete().catch(core.msgSendError);
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
    core.addCMD(["clean",      cleanUpMessages,           "Allows to clean-up a pile of old messages in the current channel"]);
}

// Catch the newbie joining
function guildMemberAdd(/*Client*/ bot, /*GuildMember*/ guildMember)
{}

// Catch incoming messages: you can make foxy be more talkative or implement a custom command handler from the raw text
function messageIn(/*Client*/ bot, /*Message*/ message, /*bool*/ channelIsWritable)
{}

// Emitted whenever a channel is updated - e.g. name change, topic change, channel type change.
function channelUpdate(/*Client*/ bot, /*GuildChannel*/ oldChannel, /*GuildChannel*/ newChannel)
{}

module.exports =
{
    registerCommands:   registerCommands
};
