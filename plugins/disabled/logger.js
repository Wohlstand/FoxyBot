/*
    Logger of message events (create, edit, remove)
*/

// Main module of FoxyBot
var core = undefined;

// Initialize plugin and here you can add custom Foxy's commands
function registerCommands(/*bot_commands.js module*/ foxyCore)
{
    core = foxyCore;
}

// Catch incoming messages: you can make foxy be more talkative or implement a custom command handler from the raw text
function messageIn(/*Client*/ bot, /*Message*/ message, /*bool*/ channelIsWritable)
{
    //var channel = bot.channels.get("295860232532525056");
    if(core.mydb == undefined)
        return;

    var mydb = core.mydb;
    var insertQuery =   "INSERT INTO foxy_message_log (guild_id, room_id, guild_name, room_name, event, author_id, is_bot, author_name, author_nick, message) "+
                        "values (" +
                        message.guild.id.toString() + ", " +
                        message.channel.id.toString() + ", " +
                        mydb.escape(message.guild.name) + ", " +
                        mydb.escape(message.channel.name) + ", " +
                        0 + ", " +
                        message.author.id.toString() + ", " +
                        (message.author.bot ? 1 : 0) + ", " +
                        mydb.escape(message.author.username + "#" + message.author.discriminator) + ", " +
                        mydb.escape(message.member.nickname == null ? message.author.username : message.member.nickname) + ", " +
                        mydb.escape(message.content) +
                        ");";

    //channel.send(insertQuery).catch(core.msgSendError);

    mydb.query(insertQuery, core.errorMyDb);
}

function messageUpdate(/*Client*/ bot, /*Old Message*/ messageOld, /*New Message*/ message, /*bool*/ channelIsWritable)
{
    if(core.mydb == undefined)
        return;
    var mydb = core.mydb;

    var insertQuery =   "INSERT INTO foxy_message_log (guild_id, room_id, guild_name, room_name, event, author_id, is_bot, author_name, author_nick, message, message_old) "+
                        "values (" +
                        message.guild.id.toString() + ", " +
                        message.channel.id.toString() + ", " +
                        mydb.escape(message.guild.name) + ", " +
                        mydb.escape(message.channel.name) + ", " +
                        1 + ", " +
                        message.author.id.toString() + ", " +
                        (message.author.bot ? 1 : 0) + ", " +
                        mydb.escape(message.author.username + "#" + message.author.discriminator) + ", " +
                        mydb.escape(message.member.nickname == null ? message.author.username : message.member.nickname) + ", " +
                        mydb.escape(message.content) + ", " +
                        mydb.escape(messageOld.content) +
                        ");";

    mydb.query(insertQuery, core.errorMyDb);
}

function messageDelete(/*Client*/ bot, /*Message*/ message, /*bool*/ channelIsWritable)
{
    if(core.mydb == undefined)
        return;
    var mydb = core.mydb;
    var insertQuery =   "INSERT INTO foxy_message_log (guild_id, room_id, guild_name, room_name, event, author_id, is_bot, author_name, author_nick, message) "+
                        "values (" +
                        message.guild.id.toString() + ", " +
                        message.channel.id.toString() + ", " +
                        mydb.escape(message.guild.name) + ", " +
                        mydb.escape(message.channel.name) + ", " +
                        2 + ", " +
                        message.author.id.toString() + ", " +
                        (message.author.bot ? 1 : 0) + ", " +
                        mydb.escape(message.author.username + "#" + message.author.discriminator) + ", " +
                        mydb.escape(message.member.nickname == null ? message.author.username : message.member.nickname) + ", " +
                        mydb.escape(message.content) +
                        ");";

    mydb.query(insertQuery, core.errorMyDb);
}

module.exports =
{
    // Initialize plugin and here you can add custom Foxy's commands
    registerCommands:   registerCommands,
    // Catch incoming messages: you can make foxy be more talkative or implement a custom command handler from the raw text
    messageIn:          messageIn,
    messageUpdate:      messageUpdate,
    messageDelete:      messageDelete
};

