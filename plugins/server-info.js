/*
    Server information commands
*/

// Main module of FoxyBot
let core = undefined;
let exec = require('child_process').execFile;

function serverUptime(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    exec('uptime', ["--pretty"], {}, function(err, data)
    {
        if(err == null)
        {
            let s = data.toString();
            if(s.length > 1900)
                s = s.substr(s.length - 1900);
            message.channel.send("Uptime of server is\n```\n" + s + "\n```\n").catch(core.msgSendError);
        }
        else
        {
            message.reply("ERROR of uptime --pretty```\n" + err + "\n\n" + data.toString() + "\n```\n");
        }
    });
}

function serverUnameA(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    exec('uname', ["-a"], {}, function(err, data)
    {
        if(err == null)
        {
            let s = data.toString();
            if(s.length > 1900)
                s = s.substr(s.length - 1900);
            message.channel.send("UNAME:\n```\n" + s + "\n```\n").catch(core.msgSendError);
        }
        else
        {
            message.reply("ERROR of uname -a```\n" + err + "\n\n" + data.toString() + "\n```\n");
        }
    });
}

function ifconfig(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    let ip_expr = /inet (\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/;
    let rx_traffic = /RX packets \d+ +bytes \d+ \(([0-9.TtGgMmKkiBb ]+)\)/;
    let tx_traffic = /TX packets \d+ +bytes \d+ \(([0-9.TtGgMmKkiBb ]+)\)/;
    let rx_stats = /RX errors (\d+) +dropped +(\d+) +overruns +(\d+) +frame +(\d+)/;
    let tx_stats = /TX errors (\d+) +dropped +(\d+) +overruns +(\d+) +carrier +(\d+) +collisions +(\d+)/;

    let outMsg = "**Information about server network interfaces:**\n\n";
    let ifaces = ["ethlan1", "ethlan2"];//Queue

    let runIfConfig = function()
    {
        let i = ifaces.shift();
        exec('ifconfig', [i], {}, function(err, data)
        {
            try
            {
                if(err == null)
                {
                    let s = data.toString();
                    let ip = ip_expr.exec(s);
                    let rxt = rx_traffic.exec(s);
                    let txt = tx_traffic.exec(s);
                    let rxs = rx_stats.exec(s);
                    let txs = tx_stats.exec(s);

                    outMsg += "**Interface name**: " + i + "\n" +
                              "**Internal IP address:** " + ip[1] + "\n" +
                              "**Received bytes:** " + rxt[1] + "\n" +
                              "**Transfered bytes:** " + txt[1] + "\n" +
                              "**Receive stas:** errors: " + rxs[1] + "; drops: " + rxs[2] + "; overruns " + rxs[3] + "; frame " + rxs[4] + "\n" +
                              "**Transfer stas:** errors: " + txs[1] + "; drops: " + txs[2] + "; overruns " + txs[3] + "; carrier " + txs[4] + "; collisions " + txs[4] + "\n" +
                              "\n";
                    if(ifaces.length > 0)
                        runIfConfig();
                    else
                        message.channel.send(outMsg).catch(core.msgSendError);
                }
                else
                {
                    message.reply("ERROR of running ifconfig```\n" + err + "\n\n" + data.toString() + "\n```\n");
                }
            }
            catch(e)
            {
                message.reply("ERROR of inconfig's output parse: ```\n" + e.name + "\n\n" + e.message + "\n\n" + e.stack + "\n```\n");
            }
        });
    };

    runIfConfig();
}

function speedtest(/*Client*/ bot, /*Message*/ message, /*string*/ args)
{
    message.channel.send("Speed testing began, wait a few seconds...").catch(core.msgSendError);
    exec('speedtest', ["--json"], {}, function(err, data)
    {
        if(err == null)
        {
            try
            {
                let s = data.toString();
                let obj = JSON.parse(s);

                let out = "__**Speed test statistics:**__\n\n" +
                          "**Ping**: " + obj.ping + " ms\n" +
                          "**Speed upload**: " + (obj.upload / (1024 * 1024)).toFixed(2) + " Mbps\n" +
                          "**Speed download**: " + (obj.download / (1024 * 1024)).toFixed(2) + " Mbps\n" +
                          "\n__**Server used for a speed testing:**__\n\n" +
                          "**Country**: " + obj.server.country + "\n" +
                          "**Server name**: " + obj.server.name + "\n" +
                          "**Location**: " + obj.server.lat + " : " + obj.server.lon +"\n" +
                          "**Sponsor**: " + obj.server.sponsor + "\n" +
                          "**Latency**: " + obj.server.latency + "\n" +
                          "";

                message.channel.send(out).catch(core.msgSendError);
            }
            catch(e)
            {
                message.reply("ERROR of speedtest's output parse: ```\n" + e.name + "\n\n" + e.message + "\n\n" + e.stack + "\n```\n");
            }
        }
        else
        {
            message.reply("ERROR of uname -a```\n" + err + "\n\n" + data.toString() + "\n```\n");
        }
    });
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
    core.addCMD(["server-uptime",      serverUptime,    "Retreive uptime of server where I living now :desktop:"]);
    core.addCMD(["server-uname",       serverUnameA,    "Get short information about operating system of my server"]);
    core.addCMD(["server-network",     ifconfig,        "Get short information about network of my server"]);
    core.addCMD(["server-speedtest",   speedtest,       "Run an internet connection speed-test in the network of my server"]);
}

module.exports =
{
    // Initialize plugin and here you can add custom Foxy's commands
    registerCommands:   registerCommands
};
