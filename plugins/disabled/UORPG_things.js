/*
    A small plugin made for especially for UORPG chat server
*/

let core = undefined;

let UORPG_Server = "177730395352072192";

let Chan_RUS = "203294045689217024";
let Chan_ENG = "199908461549584384";
let Chan_LAT = "369616743200456715";

function isRussian(chan)
{
    return (chan.id === Chan_RUS);
}

function getChaos(guild)
{
    return guild.roles.cache.find('name', 'Chaos');
}

function getOrder(guild)
{
    return guild.roles.cache.find('name', 'Order');
}

function getRenegades(guild)
{
    return guild.roles.cache.find('name', 'Renegades');
}

function getKeys(obj)
{
    let keys = "";
    for(let key in obj)
    {
        keys += key + "; ";
    }
    return keys;
}

function cleanRoles(bot, message, args, newRole)
{
    message.guild.members.fetch(message.author)
    .then(function(gotMember) {
        let chaos = getChaos(message.guild);
        let order = getOrder(message.guild);
        let renegades = getRenegades(message.guild);
        let member = gotMember;
        member.removeRoles([order, chaos, renegades]).then(function(e) {
                //message.channel.send("DEBUG [" + e +"]").catch(core.msgSendError);
                member.addRole(newRole);
        });
    }).catch(function(err){
        // core.sendEmailRaw(bot, message,"Something weird happen! I can't clean-up old roles! (error is [" + err +"])", core.msgSendError);
    });
}

function joinOrder(bot, message, args)
{
    let order = getOrder(message.guild);
    cleanRoles(bot, message, args, order);
    message.reply("Welcome to Order!", core.msgSendError);
}

function joinChaos(bot, message, args)
{
    let chaos = getChaos(message.guild);
    cleanRoles(bot, message, args, chaos);
    message.reply("Welcome to Chaos!", core.msgSendError);
}

function joinRenegades(bot, message, args)
{
    let renegades = getRenegades(message.guild);
    cleanRoles(bot, message, args, renegades);
    message.reply("Welcome to Renegades!", core.msgSendError);
}

function crystalPhase(bot, message, args)
{
    let oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    let firstDate = new Date(2017,11,2);//Точка отсчёта чётности
    let secondDate = new Date();

    let diffDays = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));

    let rus = bot.channels.resolve(Chan_RUS);
    let lat = bot.channels.resolve(Chan_LAT);
    //var eng = bot.channels.get(Chan_ENG);

    let crystal_peace;
    let crystal_war;

    if(message.channel.id === rus.id)
    {
        crystal_peace = "# Кристал в мирной проекции мира.";
        crystal_war = "# Кристал в боевой проекции мира.";
    }
    else if(message.channel.id === lat.id)
    {
        crystal_peace = "# Kristāls ir pasaules mierā projekcijā.";
        crystal_war = "# Kristāls ir pasaules karā projekcijā.";
    }
    else
    {
        crystal_peace = "# The Crystal is in the peace projection of the world.";
        crystal_war = "# The Crystal is in the war projection of the world.";
    }

    if((diffDays % 2) === 0)
        message.channel.send(crystal_peace).catch(core.msgSendError);
    else
        message.channel.send(crystal_war).catch(core.msgSendError);
}


function registerCommands(foxyCore)
{
    core = foxyCore;
    core.addCMD(["order",      joinOrder,           "Join The Order Alliance - Holy Empire and Insurgents!!!", [], true, [UORPG_Server] ]);
    core.addCMD(["chaos",      joinChaos,           "Join The Chaos Alliance - Army of Darkness and The Shadows!!!", [], true, [UORPG_Server] ]);
    core.addCMD(["renegades",  joinRenegades,       "Join Renegades - traitors and outcasts; players without alliance.", [], true, [UORPG_Server] ]);
    core.addCMD(["crystal",    crystalPhase,        "Show projection where crystal is located", [], true, [UORPG_Server] ]);
}

function guildMemberAdd(bot, guildMember)
{
    // console.log("Кто-то новенький! " + guildMember.user.id +
    // " на серваке " + guildMember.guild.id + " == " + UORPG_Server);
    if(guildMember.guild.id === UORPG_Server)
    {
        let ru = bot.channels.resolve(Chan_RUS);
        let en = bot.channels.resolve(Chan_ENG);

        let message_ru =
            "<@" + guildMember.user.id +">, Приветствуем вас на сервере Ultima Online - UORPG.net!\n\n" +
            "Выберите вашу фракцию:\n" +
            "Альянс Порядок - Священная Империя и Повстанцы\n" +
            "Альянс Хаос - Армия Тьмы и Тени\n" +
            "Ренегаты - предатели и отступники, войны без альянса.\n\n" +
            "Для того, чтобы выбрать вашу сторону в войне напишите в чате: /foxy order, /foxy chaos или /foxy renegades";
        let message_en =
            "<@" + guildMember.user.id +">, Hi, welcome to Ultima Online server - UORPG.net!\n\n" +
            "Assign your faction please:\n" +
            "The Order Alliance - Holy Empire and Insurgents\n" +
            "The Chaos Alliance - Army of Darkness and The Shadows\n"+
            "The Renegades - traitors and outcasts; players without alliance.\n\n"+
            "In order to confirm your war force, type: /foxy order ; /foxy chaos ;  /foxy renegades";

        ru.send(message_ru).catch(core.msgSendError);
        en.send(message_en).catch(core.msgSendError);
    }
}

module.exports =
{
    registerCommands:   registerCommands,
    guildMemberAdd:     guildMemberAdd
};

