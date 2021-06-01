/*
    Tracker of the meme channel renames at the Moondust Official Server
*/

// Main module of FoxyBot
let core = undefined;

// Initialize plugin and here you can add custom Foxy's commands
function registerCommands(/*bot_commands.js module*/ foxyCore)
{
    core = foxyCore;
}

// Emitted whenever a channel is updated - e.g. name change, topic change, channel type change.
function channelUpdate(/*Client*/ bot, /*GuildChannel*/ oldChannel, /*GuildChannel*/ newChannel)
{
    if(core.my_db === undefined || core.my_db === null)
        return; // Can't write database at all

    if(oldChannel.name === newChannel.name)
        return; // Nothing to do, name wasn't changed

    if(newChannel.guild.id !== "692079249594515607" /*Moondust Server*/ && newChannel.guild.id !== "506558672130801665"/*My test server*/)
        return; // Not that guild

    if(newChannel.id !== "750760326336741479" && newChannel.id !== "849255877239373855")
        return; // Not that channel

    let myDb = core.my_db;
    let insertQuery =   "INSERT INTO moondust_meme_names (`name`) " + "values (" + myDb.escape(newChannel.name) + ");";
    myDb.query(insertQuery, core.errorMyDb);
}

module.exports =
{
    registerCommands:   registerCommands,
    channelUpdate:      channelUpdate
};
