
var core = undefined;

var testUrl = function(bot, message, args)
{
    message.channel.send("http://wohlsoft.ru").catch(core.msgSendError);
}

var lab = function(bot, message, args)
{
    message.channel.send("http://wohlsoft.ru/docs/_laboratory/").catch(core.msgSendError);
}

var smbx2pgeUpdate = function(bot, message, args)
{
    message.channel.send("http://wohlsoft.ru/forum/viewtopic.php?f=11&t=1977").catch(core.msgSendError);
}

var repo = function(bot, message, args)
{
    message.channel.send("https://github.com/WohlSoft/PGE-Project").catch(core.msgSendError);
}

var markup = function(bot, message, args)
{
    message.channel.send("https://support.discordapp.com/hc/en-us/articles/210298617").catch(core.msgSendError);
}


function registerCommands(foxyCore)
{
    core = foxyCore;
    core.addCMD(["testurl",  testUrl,          "Test of URL returning. Just return a WohlSoft site url!"]);
    core.addCMD(["lab",      lab,              "Returns PGE Laboratory URL"]);
    core.addCMD(["s2p",      smbx2pgeUpdate,   "Returns URL to PGE update guide for SMBX 2"]);
    core.addCMD(["repo",     repo,             "Returns URL to PGE repository on GitHub"]);
    core.addCMD(["markup",   markup,           "Returns URL for a Discord markdown guide"]);
}

module.exports =
{
    registerCommands:   registerCommands
};
