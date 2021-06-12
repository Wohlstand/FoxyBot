/*
    Tracker of the meme channel renames at the Moondust Official Server
*/

// Main module of FoxyBot
let core = undefined;

let Moondust_Server = "692079249594515607";

function pad(num, size) {
    let s = "000000000" + num;
    return s.substr(s.length-size);
}

function formatDate(date)
{
    return ""
        + date.getFullYear() + "年"
        + pad(date.getMonth() + 1, 2)  + "月"
        + pad(date.getDate(), 2) + "日" + " @ "
        + pad(date.getHours(), 2) + ":"
        + pad(date.getMinutes(), 2) + ":" + pad(date.getSeconds(), 2) + ", UTC+3";
}

function listMemes(bot, message, args)
{
    try
    {
        let myDb = core.my_db;
        myDb.query('SELECT * FROM moondust_meme_names ORDER BY `date` ASC;',
            function (error, results, fields)
            {
                try
                {
                    if(error)
                    {
                        core.foxyLogInfo("Error happen! " + error);
                        return;
                    }

                    let memesHeader = "**History of the memes channel:**\n\n(年 - year, 月 - month, 日 - day)\n\n";
                    let memesLog = ""

                    //foxyLogInfo('The solution is: ', results[0].solution);
                    for(let i = 0; i < results.length; i++)
                    {
                        memesLog += "- **" + results[i].name + "** (" + formatDate(results[i].date) + ")\n";
                    }

                    let doShowHel = core.getRandomInt(0, 2);
                    switch(doShowHel)
                    {
                    case 0:
                        memesLog += "\n喝了这 :funnycat:"
                        break;
                    case 1:
                        memesLog += "\nFunnyFace won :hel:"
                        break;
                    case 2:
                        memesLog += "\nMeme man won, Viktori! :weegee:"
                        break;
                    }

                    let sendText = memesHeader + memesLog;

                    let maxLen = 2000;
                    if(sendText.length > maxLen) // Make sure the length is not excited
                    {
                        memesHeader += "(more, " + maxLen + " chars limit) ...\n";
                        while (sendText.length > maxLen)
                        {
                            memesLog = memesLog.substr(memesLog.indexOf('\n') + 1);
                            sendText = memesHeader + memesLog;
                        }
                    }

                    let channel = message.channel;
                    if(channel === undefined)
                        core.foxyLogInfo("Error happen! the channel is unavailable!");
                    else
                    {
                        core.foxyLogInfo(sendText + "(number of characters: " + sendText.length + ")");
                        channel.send(sendText).catch(core.msgSendError);
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
    core.addCMD(["meme-names",    listMemes,        "Show list of the meme channel names", [], true, [Moondust_Server, "506558672130801665"] ]);
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
