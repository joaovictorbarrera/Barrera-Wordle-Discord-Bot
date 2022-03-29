// private methods
const startWordleGame = (msg, args) => {
    const WordleGame = require("./wordle")
    const wordleGames = []
    if(args.some(item => item === "quordle")) {
        for(let i = 0; i < 4; i++) {
            const opt = getOptions(args)
            if(!opt.maxGuesses) opt.maxGuesses = 9
            wordleGames.push(new WordleGame(opt))
        }
    } else {
        wordleGames.push(new WordleGame(getOptions(args)))
    }
    
    msg.channel.send(`Wordle Game Started! Big mode: ${wordleGames[0].big}, maxGuesses: ${wordleGames[0].maxGuesses}`)
    msg.channel.send(wordleGames[0].next())
    return wordleGames
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
!!wordle -> starts simple wordle game
!!wordle <args> big -> starts wordle game in big mode
!!wordle <args> [integer] -> defines custom max guesses
!!wordle <args> quordle -> creates a quordle game (4 simultaneous games)
!!ff -> surrends a wordle game

ELSE:
!!help -> displays list of bot commands
    `;
    msg.reply(helpMsg)
}

// actual handler class
class CommandHandler {
    constructor() {
        this.wordleChannel = null
        this.wordleGameActive = false
        this.wordleGames = null
        this.commands = {
            "help": (msg, args) => help(msg),
            "ping": (msg, args) => msg.reply("Pong!"),
            "wordle": (msg, args) => {
                this.wordleGames = startWordleGame(msg, args)
                this.wordleChannel = msg.channel.id
                this.wordleGameActive = true
            },
            "red": (msg, args) => {
                args.shift()
                msg.channel.send("```diff\n- " + args.join(" ") + "\n```")
            }
        }
    }
    
    handle_commands(args, msg) {
        const command = args[0].toLowerCase()
        if(this.commands[command]) {
            this.commands[command](msg, args)
        } else {
            msg.reply("This command doesn't exist.")
        }
    }

    playWordleGame(msg) {
        if(msg.content === `${process.env.PREFIX}ff`) {
            this.wordleGameActive = false
            msg.react("😢")
            msg.channel.send("Game surrended")
            return;
        }

        let failed = null
        this.wordleGames.forEach(game => {
            const res = game.makeGuess(msg.content)
            const fail_messages = [
                "Game ended",
                "Must be exactly 5 letters!",
                "Guessed already!",
                "Unnaceptable word!"
            ]
            if(!fail_messages.includes(res)) {
                msg.channel.send(res)
                msg.channel.send(game.getKeyboard())
            } else {
                failed = res
            }
        })

        if(failed && failed !== "Game ended") msg.channel.send(failed)
        
        if(this.wordleGames.every(game => game.done)) {
            if(this.wordleGames.every(game => game.status === "win")) {
                msg.channel.send("\n᲼᲼᲼᲼᲼᲼᲼᲼:green_square:You Win!:green_square:")
            } else {
                if(this.wordleGames.length === 1) {
                    msg.channel.send("\n᲼᲼᲼᲼᲼᲼᲼᲼:red_square:You Lose!:red_square:" + "\n᲼᲼᲼᲼᲼᲼᲼᲼The Word Was:\n᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼᲼" + this.wordleGames[0].secret)
                } else {
                    const secrets = this.wordleGames.map(game => game.secret)
                    msg.channel.send("\n᲼᲼᲼᲼᲼᲼᲼᲼:red_square:You Lose!:red_square:" + "\n᲼᲼᲼᲼᲼᲼᲼The Words Were:\n᲼᲼᲼" + secrets)
                }
            }
            this.wordleGameActive = false
            return;
        }
        msg.channel.send(this.wordleGames[0].next())
    }
}

// function shout(args, msg) {
//     msg.channel.send(args.map(item => item.toUpperCase()).reduce((all, current) => all += current + " ", ""))
// }

module.exports = CommandHandler