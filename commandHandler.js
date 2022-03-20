// private methods
const startWordleGame = (msg, args) => {
    const WordleGame = require("./wordle")
    const wordleGame = new WordleGame(getOptions(args))
    msg.channel.send(`Wordle Game Started! Big mode: ${wordleGame.big}, maxGuesses: ${wordleGame.maxGuesses}`)
    msg.channel.send(wordleGame.next())
    return wordleGame
}

const getOptions = (args) => {
    const options = {}
    if(args.some(item => item === "big")) options["big"] = true
    if(args.some(item => /[0-9]+/.test(item))) options["maxGuesses"] = args.find(item => /[0-9]+/.test(item))
    return options
}

const help = (msg) => {
    const helpMsg =`
WORDLE:
!!wordle -> starts wordle game
!!wordle <args> big -> starts wordle game in big mode
!!wordle <args> [integer] -> defines custom max guesses
!!ff -> surrends a wordle game

ELSE:
!!help -> displays list of bot commands
    `;
    msg.reply(helpMsg)
}

// actual handler class
class CommandHandler {
    constructor() {
        this.wordleGameActive = false
        this.wordleGame = null
    }
    
    handle_commands(args, msg) {
        switch(args[0].toLowerCase()) {
            case "help":
                help(msg)
                break;
            case "ping":
                msg.reply("Pong!")
                break;
            case "wordle":
                this.wordleGame = startWordleGame(msg, args)
                this.wordleGameActive = true
                break;
            default:
                msg.reply("This command doesn't exist.")
                break;
        }
    }

    playWordleGame(msg) {
        if(msg.content === `${process.env.PREFIX}ff`) {
            this.wordleGameActive = false
            msg.react("😢")
            msg.channel.send("Game surrended")
            return;
        }
        const res = this.wordleGame.makeGuess(msg.content)
        const fail_messages = [
            "Game ended",
            "Must be exactly 5 letters!",
            "Guessed already!",
            "Unnaceptable word!"
        ]
        msg.channel.send(res)
        if(this.wordleGame.winLose != null) msg.channel.send(this.wordleGame.winLose)
        if(!fail_messages.includes(res)) msg.channel.send(this.wordleGame.getKeyboard())
    
        if(this.wordleGame.done) {
            this.wordleGameActive = false
            return;
        }
        msg.channel.send(this.wordleGame.next())
        return;
    }
}

// function shout(args, msg) {
//     msg.channel.send(args.map(item => item.toUpperCase()).reduce((all, current) => all += current + " ", ""))
// }

module.exports = CommandHandler