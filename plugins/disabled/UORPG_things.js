/*
    A small plugin made for especially for UORPG chat server
*/

var core = undefined;

var UORPG_Server = "177730395352072192";

var Chan_RUS = "203294045689217024";
var Chan_ENG = "199908461549584384";

function isRussian(chan)
{
    return (chan.id == Chan_RUS);
}

function getChaos(guild)
{
    return guild.roles.find('name', 'Chaos');
}

function getOrder(guild)
{
    return guild.roles.find('name', 'Order');
}

var joinOrder = function(bot, message, args)
{
    var chaos = getChaos(message.guild);
    var order = getOrder(message.guild);
    var member = message.guild.members.get(message.author.id);
    member.removeRole(chaos);
    member.addRole(order);
    message.reply("Welcome to Order!", core.msgSendError);
}

var joinChaos = function(bot, message, args)
{
    var chaos = getChaos(message.guild);
    var order = getOrder(message.guild);
    var member = message.guild.members.get(message.author.id);
    member.removeRole(order);
    member.addRole(chaos);
    message.reply("Welcome to Chaos!", core.msgSendError);
}

var crystalPhase = function(bot, message, args)
{
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var firstDate = new Date(2017,11,1);//Точка отсчёта чётности
    var secondDate = new Date();

    var diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));

    var ru = bot.channels.get(Chan_RUS);
    //var en = bot.channels.get(Chan_ENG);

    var crystal_peace;
    var crystal_war;

    if(message.channel.id == ru.id)
    {
        crystal_peace = "# Кристал в мирной проекции мира.";
        crystal_war = "# Кристал в боевой проекции мира.";
    }
    else
    {
        crystal_peace = "# The Crystal is in the world projection of the peace.";
        crystal_war = "# The Crystal is in the world projection of the war.";
    }

    if((diffDays % 2) == 0)
        message.channel.send(crystal_peace).catch(core.msgSendError);
    else
        message.channel.send(crystal_war).catch(core.msgSendError);
}


function registerCommands(foxyCore)
{
    core = foxyCore;
    core.addCMD(["order",      joinOrder,           "Join The Order Alliance - Holy Empire and Insurgents!!!", [], true, [UORPG_Server] ]);
    core.addCMD(["chaos",      joinChaos,           "Join The Chaos Alliance - Army of Darkness and The Shadows!!!", [], true, [UORPG_Server] ]);
    core.addCMD(["crystal",    crystalPhase,        "Show projection where crystal is located", [], true, [UORPG_Server] ]);
}

function guildMemberAdd(bot, guildMember)
{
    // console.log("Кто-то новенький! " + guildMember.user.id +
    // " на серваке " + guildMember.guild.id + " == " + UORPG_Server);
    if(guildMember.guild.id == UORPG_Server)
    {
        var ru = bot.channels.get(Chan_RUS);
        var en = bot.channels.get(Chan_ENG);

        var message_ru =
            "<@" + guildMember.user.id +">, Приветствуем вас на сервере Ultima Online - UORPG.net!\n\n" +
            "Выберите вашу фракцию:\n" +
            "Альянс Порядок - Священная Империя и Повстанцы\n" +
            "Альянс Хаос - Армия Тьмы и Тени\n\n" +
            "Для того, чтобы выбрать вашу сторону в войне напишите в чате: /foxy order или /foxy chaos";
        var message_en =
            "<@" + guildMember.user.id +">, Hi, welcome to Ultima Online server - UORPG.net!\n\n" +
            "Assign your faction please:\n" +
            "The Order Alliance - Holy Empire and Insurgents\n" +
            "The Chaos Alliance - Army of Darkness and The Shadows\n\n"+
            "In order to confirm your war force, type: /foxy order ;  /foxy chaos";

        ru.send(message_ru).catch(core.msgSendError);
        en.send(message_en).catch(core.msgSendError);
    }
}

module.exports =
{
    registerCommands:   registerCommands,
    guildMemberAdd:     guildMemberAdd
};
