require("dotenv").config()
const Discord = require('discord.js')
const Handler = new (require('./commandHandler'))()
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"] })

client.on('messageCreate', (msg) => {
    // message is from an user
    if (msg.author.bot) return;
    // if there's a wordle game active, any message is a game entry
    if (Handler.wordleGameActive) {Handler.playWordleGame(msg); return}
    // no prefix or msg equals prefix (no args)
    if (msg.content.indexOf(process.env.PREFIX) !== 0) return;
    if (msg.content === process.env.PREFIX) return;
    
    // gets list of args
    const args = msg.content.slice(process.env.PREFIX.length).split(" ")

    // handles commands
    Handler.handle_commands(args, msg)
})

client.login(process.env.BOT_TOKEN)

client.on('ready', () => {
    client.user.setActivity(`${process.env.PREFIX}help`, {type: "PLAYING"})
    console.log('\u001b[33m [INFO]', `\u001b[32mBot started successfully! \u001b[0m\u001b`)
})

