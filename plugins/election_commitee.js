/*
    A small election system
*/

let core = undefined;

let votingVotings = [];

function countVotes(chid)
{
    let votingResult = [];
    let votingResultMsg = "";
    if(Object.size(votingVotings[chid].voters) === 0)
    {
        votingResultMsg = "No one voted :confused:";
    } else {
        let voters = votingVotings[chid].voters;
        for(let i=0; i<votingVotings[chid].votingVariants.length; i++)
        {
            votingResult[i] = [];
            votingResult[i].title = votingVotings[chid].votingVariants[i];
            votingResult[i].votes = 0;
        }
        for(v in voters)
        {
            var voteTo = voters[v];
            votingResult[voteTo].votes += 1;
        }
        for(i in votingResult)
        {
            votingResultMsg += (parseInt(i, 10)+1) + ") " + votingResult[i].title + " --> **" + votingResult[i].votes + "**\n";
        }
    }
    return votingResultMsg;
}

var voting = function(bot, message, args)
{
    var chid = message.channel.id;
    if(typeof(votingVotings[message.channel.id])==='undefined')
    {
        votingVotings[chid] = [];
        votingVotings[chid].votingInProcess = false;
    }
    core.foxylogInfo("====Voting mechanism====");
    //on "start <variants>" begin vote counts
    if(args.indexOf("start ") !== -1)
    {
        core.foxylogInfo("--start--");
        if(votingVotings[chid].votingInProcess)
        {
            message.reply("Another voting in process! Finish this voting and then you will be able to start new one!", core.msgSendError);
            return;
        }
        let variants = args.slice(6);
        if(variants.trim() === "")
        {
            message.reply("Nothing to vote!", core.msgSendError);
            return;
        }
        votingVotings[chid].voters = [];//If user is here - ignore next votes. Revoting is not allowed
        votingVotings[chid].votingVariants = variants.split(";");
        let voteMsg = "**Voting variants:**\n"
        for(var i=0;i<votingVotings[chid].votingVariants.length; i++)
        {
            votingVotings[message.channel.id].votingVariants[i] = votingVotings[chid].votingVariants[i].trim();
            voteMsg += " **" + (i+1) + ")** " + votingVotings[chid].votingVariants[i] + "\n";
        }

        voteMsg += "\nTo vote type __/foxy vote **N**__. N is a number of variant. Re-voting is allowed."

        votingVotings[chid].votingInProcess = true;
        message.channel.send("Voting started!\n\n" + voteMsg).catch(core.msgSendError);
    }
    //on "stats" show result
    else
    if(args.indexOf("stats") !== -1)
    {
        core.foxylogInfo("--stats--");
        if(!votingVotings[chid].votingInProcess)
        {
            message.channel.send("No votings in this channel! Type **/foxy help voting** to learn how to work with voting.").catch(core.msgSendError);
            return;
        }
        let votingResultMsg = countVotes(chid);
        message.channel.send("**Current voting state**:\n" + votingResultMsg).catch(core.msgSendError);
    }
    //on "stop" abort voting process and show result
    else
    if((args.indexOf("stop") !== -1) || (args.indexOf("end") !== -1))
    {
        core.foxylogInfo("--stop--");
        if(!votingVotings[chid].votingInProcess)
        {
            message.reply("No voting in this channel to stop!", core.msgSendError);
            return;
        }
        votingVotings[chid].votingInProcess = false;
        var votingResultMsg = countVotes(chid);
        message.channel.send("**Voting stopped!**\n" + votingResultMsg).catch(core.msgSendError);
    } else {
    //on "<number of variant>" add voter
        core.foxylogInfo("--vote--");
        if(!votingVotings[chid].votingInProcess)
        {
            message.reply("No votings to vote! Type **/foxy help voting** to learn how to work with voting.", core.msgSendError);
            return;
        }
        core.foxylogInfo("Got vote: " + args.trim() );
        var vote = parseInt(args.trim(), 10);
        if( (vote != NaN) )
        {
            if( (vote > 0) && (vote <= votingVotings[chid].votingVariants.length) )
            {
                core.foxylogInfo("Vote remembered: " + vote);
                if(typeof(votingVotings[chid].voters[message.author.id]) !== 'undefined')
                    message.react("🔄");//Mark re-voting
                votingVotings[chid].voters[message.author.id] = (vote - 1);
                message.react("✅");//Mark vote as accepted
            } else {
                message.reply("Out of range!, Vote variant from 1 to " + (votingVotings[chid].votingVariants.length), core.msgSendError);
            }
        } else {
            //foxylogInfo("Vote invalid: " + vote);
            message.reply("Unknown command! Accepted commands are **start**, **stats**, **stop**, or integer of the variant!", core.msgSendError);
        }
    }
}




// Initialize plugin and here you can add custom Foxy's commands
function registerCommands(/*bot_commands.js module*/ foxyCore)
{
    core = foxyCore;
    core.addCMD(["voting",   voting,      "Wanna choice some? Let's vote!\n"+
                                          "__*Syntax:*__:\n\n"+
                                          " **/foxy voting start __Bonana; Sausidge; Apple; Chicken; Fried mice__**\n" +
                                          "__Start a voting with a list of variants (there are must be splited with semicolons!)__\n\n" +
                                          " **/foxy vote __<variant ID>__**\n__Do Vote for any variant you are prefer (from 1 to N)__\n\n" +
                                          " **/foxy voting stats**\n__Print a result without aborting of the voting__\n\n" +
                                          " **/foxy voting stop**\n **/foxy voting end**\n__Stop voting and print a result__\n", [], true]);

    core.addSynonimOf("voting", "vote");
    core.addSynonimOf("voting", "votes");
    core.addSynonimOf("voting", "votings");
}


module.exports =
{
    registerCommands:   registerCommands,
};
