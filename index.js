const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, {
    polling: true
});

bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, `
    The bot can generate transaction based on user requests
    1./transfer [destination address] [amount] [currency] [blockchain]: help transfer native and non-native tokens
    `)
})
bot.onText(/\/transfer (.+)/, (msg, match) => {
    const args = match[1].split(" ");
    if(args.length < 2){
        bot.sendMessage(msg.chat.id,`The destination address and amount are required`)
        return;
    }
    let currency;
    let blockchain;
    const destinationAddress = args[0];
    let amount;
    try{
        amount = parseFloat(args[1]);
    }catch(err){
        bot.sendMessage(msg.chat.id, `Amount must be a number`)
        return;
    }

    amount = amount.toExponential(4).split("")
    const plusIndex = amount.indexOf("+");
    if(plusIndex !== -1){
        amount.splice(plusIndex, 1);
    }
    amount = amount.join("");
    if(args.length > 2) currency = args[2];
    if(args.length > 3) blockchain = args[3];

    let contractAddress;
    let chainId;
    
    if(!blockchain || blockchain == "ETH"){
        chainId = 1;
        if(currency == "DAI"){
            contractAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
        }else if(currency && currency !== "ETH"){
            bot.sendMessage(msg.chat.id, `Token ${currency} is not supported`)
            return;
        }
    }else if(blockchain == "BNB"){
        chainId = 56;
        if(currency == "DAI"){
            contractAddress = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3"
        }else if(currency && currency !== "ETH"){
            bot.sendMessage(msg.chat.id, `Token ${currency} is not supported`)
            return;
        }
    }else{
        bot.sendMessage(msg.chat.id, `Chain ${blockchain} is not supported`);
        return;
    }

    let deeplink;
    if(!contractAddress){
        deeplink = `https://metamask.app.link/send/${destinationAddress}@${chainId}?value=${amount}`
    }else{
        deeplink = `https://metamask.app.link/send/${contractAddress}@${chainId}/transfer?address=${destinationAddress}&uint256=${amount}`
    }

    bot.sendMessage(msg.chat.id, "Here is your transaction", {reply_markup: {
        inline_keyboard: [
            [{
                text: 'sign with Metamask mobile',
                url: deeplink
            }]
        ]
    }})
})

console.log("bot launched")