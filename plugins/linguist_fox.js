/*
    Foxy can speak any language and can help you spean with anyone!
 */

let YandexTranslator = require('yandex.translate');

// Translator instance
let translator = undefined;

// Main module of FoxyBot
let core = undefined;

//var langReg = new RegExp("/^\[([a-z]){2-8}\&]/ig", "ig");
function isLanguage(word)
{
    return /^\[([a-z]){2,8}]$/ig.test(word.trim());
}

let langChannels = require("./linguist_fox_channel_langs.json");

function translate(bot, message, args)
{
    let phrase = { orig: args, res: "..."};
    let arg1 = core.cutWord(phrase);
    if(!isLanguage(arg1))
    {
        //Detect channel specific language
        let chID = message.channel.id;
        if(langChannels[chID] !== undefined)
            arg1 = langChannels[chID];
        else
            arg1 = 'en';
        phrase.res = phrase.orig;
        core.foxyLogInfo("-> Using channel language...");
    }
    else
    {
        let re = /^\[([a-z]{2,8})]$/ig;
        let m;
        while ((m = re.exec(arg1)) !== null)
        {
            if (m.index === re.lastIndex)
                re.lastIndex++;
            arg1 = m[1];
        }
    }

    if(phrase.res === "")
    {
        message.reply("Can't translate nothing!");
        return;
    }

    core.foxyLogInfo("-> Translate into " + arg1 + " the phraze " + phrase.res);
    translator.translate(phrase.res, arg1)
    .then(function(translation)
    {
        core.foxyLogInfo(translation);
        if(message.editable)
        {
            message.edit(translation);
        } else {
            let msgText = "\n" + translation;
            let title = message.author.username + "#" + message.author.discriminator;
            message.channel.send(
            {
                embeds:
                [
                    {
                        color: 0xffff66,
                        fields: [{
                            name : title,
                            value: msgText
                        }],
                        footer: {
                            text: "Powered by Yandex.Translate (https://translate.yandex.ru)"
                        },
                        url: "https://translate.yandex.ru"
                    }
                ]
            }).catch(core.msgSendError);
            //core.say(bot, message,  "__**[" + message.author.username + "#" + message.author.discriminator + "]**__: " + translation);
        }
    },
    function(fail)
    {
        message.reply("Can't translate: " + fail, core.msgSendError);
    }).catch(core.msgSendError);
}

// Initialize plugin and here you can add custom Foxy's commands
function registerCommands(/*bot_commands.js module*/ foxyCore)
{
    core = foxyCore;
    translator = new YandexTranslator(core.botConfig.trkey);

    core.addCMD(["tr",       translate,   "Хочешь говорить на другом языке?\n"+
                                          "I'll translate your phrase into any language you want\n\n"+
                                          "__*Syntax:*__:\n\n"+
                                          " **/foxy tr [de] __Please, help me find my street!__**\n" +
                                          "__Translate phrase to any language you want. In this example translate phrase into German__\n\n" +
                                          " **/foxy tr __Я говорю по-немецки!__**\n" +
                                          "__Automatically detect language of channel and translate to that language__\n\n" +
                                          "Language of source phrase will be detected automatically.", [], true]);
}

module.exports =
{
    registerCommands:   registerCommands,
};
