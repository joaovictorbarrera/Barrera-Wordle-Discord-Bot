require("dotenv").config()
const Discord = require('discord.js')
const handle_commands = require('./commandHandler.js')
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"] })

client.on('messageCreate', (msg) => {
    if (msg.author.bot) return;
    handle_commands(msg)
})

client.login(process.env.BOT_TOKEN)

client.on('ready', () => {
    client.user.setActivity(`${process.env.PREFIX}help`, {type: "PLAYING"})
    console.log('\u001b[33m [INFO]', `\u001b[32mBot started successfully! \u001b[0m\u001b`)
})

