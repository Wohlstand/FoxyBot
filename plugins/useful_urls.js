
let core = undefined;

function testUrl(bot, message, args)
{
    message.channel.send("https://wohlsoft.ru/").catch(core.msgSendError);
}

function lab(bot, message, args)
{
    message.channel.send("http://wohlsoft.ru/projects/Moondust/_laboratory/").catch(core.msgSendError);
}

function smbx2pgeUpdate(bot, message, args)
{
    message.channel.send("http://wohlsoft.ru/forum/viewtopic.php?f=11&t=1977").catch(core.msgSendError);
}

function repo(bot, message, args)
{
    message.channel.send("https://github.com/WohlSoft/Moondust-Project").catch(core.msgSendError);
}

function markup(bot, message, args)
{
    message.channel.send("https://support.discordapp.com/hc/en-us/articles/210298617").catch(core.msgSendError);
}

function isURL(str)
{
    // https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url/30229098
    let pattern = new RegExp('^(https?:\\/\\/)' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])?)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-zA-Z\\:\\(\\)\\d%_.~+]*)*' + // port and path
    '(\\?[;&A-Za-z\\d%\\:\\/\\(\\)_.~+=-]*)?' + // query string
    '(\\#[-a-zA-Z\\d_]*)?$', 'i'); // fragment locater

    return pattern.test(str);
}

function isUrlCheck(bot, message, args)
{
    message.channel.send("Your string [" + args + "] is " + (isURL(args) ? "a valid" : "NOT an" ) + " URL!").catch(core.msgSendError);
}

function lunaDocs(bot, message, args)
{
    message.channel.send("https://wohlsoft.ru/pgewiki/" + encodeURIComponent(args)).catch(core.msgSendError);
}

function lunaSearch(bot, message, args)
{
    message.channel.send("https://wohlsoft.ru/wiki/index.php?search=" + encodeURIComponent(args)).catch(core.msgSendError);
}

function findInGoogle(bot, message, args)
{
    message.channel.send("https://lmgtfy.com/?q=" + encodeURIComponent(args)).catch(core.msgSendError);
}

function findInWikipedia(bot, message, args)
{
    message.channel.send("https://wikipedia.lmgtfy.com/?q=" + encodeURIComponent(args)).catch(core.msgSendError);
}


function registerCommands(foxyCore)
{
    core = foxyCore;
    core.addCMD(["testurl",  testUrl,          "Test of URL returning. Just return a WohlSoft site url!"]);
    core.addCMD(["lab",      lab,              "Returns PGE Laboratory URL"]);
//    core.addCMD(["s2p",      smbx2pgeUpdate,   "Returns URL to Moondust update guide for SMBX 2"]);
    core.addCMD(["repo",     repo,             "Returns URL to Moondust repository on GitHub"]);
    core.addCMD(["markup",   markup,           "Returns URL for a Discord markdown guide"]);
    core.addCMD(["isurl",    isUrlCheck,       "Checks is given string an URL", [], true]);

    core.addCMD(["docs",     lunaDocs,         "Open PGE-Wiki page\n__*Syntax:*__ docs <name of Moondust Wiki page>", [], true]);
    core.addCMD(["search",   lunaSearch,       "Find something in the PGE-Wiki\n__*Syntax:*__ search <search query>", [], true]);
    core.addCMD(["find",     findInGoogle,     "Find something in Google\n__*Syntax:*__ find <your question>", [], true]);
    core.addCMD(["findwiki", findInWikipedia,  "Find something in Wikipedia\n__*Syntax:*__ findwiki <your question>", [], true]);

    core.isurl = isURL; //Public this function!
}

module.exports =
{
    registerCommands:   registerCommands
};
