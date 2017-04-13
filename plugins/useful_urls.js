
var core = undefined;

var testUrl = function(bot, message, args)
{
    message.channel.sendMessage("http://wohlsoft.ru").catch(msgSendError);
}

var lab = function(bot, message, args)
{
    message.channel.sendMessage("http://wohlsoft.ru/docs/_laboratory/").catch(msgSendError);
}

var repo = function(bot, message, args)
{
    message.channel.sendMessage("https://github.com/WohlSoft/PGE-Project").catch(msgSendError);
}

var markup = function(bot, message, args)
{
    message.channel.sendMessage("https://support.discordapp.com/hc/en-us/articles/210298617").catch(msgSendError);
}


function registerCommands(foxyCore)
{
    core = foxyCore;
    core.addCMD(["testurl",  testUrl,          "Test of URL returning. Just return a WohlSoft site url!"]);
    core.addCMD(["lab",      lab,              "Returns PGE Laboratory URL"]);
    core.addCMD(["repo",     repo,             "Returns URL to PGE repository on GitHub"]);
    core.addCMD(["markup",   markup,           "Returns URL for a Discord markdown guide"]);
}

module.exports =
{
    registerCommands:   registerCommands
};

